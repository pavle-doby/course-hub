import {
  BadRequestError,
  CompleteCourseThumbnailUploadReq,
  CourseTree,
  CreateCourseDraftInput,
  CreateCourseReq,
  CreateCourseRes,
  DeleteCourseRes,
  ErrorCode,
  ErrorCodeCourse,
  GetAllCoursesRes,
  GetAllPublicCoursesReq,
  GetAllPublicCoursesRes,
  GetCourseByPublicIdRes,
  GetCourseRes,
  GetCourseTreeInput,
  GetPublicLessonsRes,
  GetPublicTopicsRes,
  InitializeCourseThumbnailUploadReq,
  InitializeCourseThumbnailUploadRes,
  UpdateCourseReq,
  UpdateCourseRes,
} from "@repo/contract";
import { ForbiddenError, NotFoundError } from "@repo/contract";
import { usersRepository } from "api/modules/users/repository/usersRepository";
import { topicsRepository } from "api/modules/topics/repository/topicsRepository";
import { lessonsRepository } from "api/modules/lessons/repository/lessonsRepository";
import { documentsService } from "api/modules/documents/services/documentsService";
import { notificationsService } from "api/modules/notifications/services/notificationsService";
import { r2Service } from "api/modules/documents/services/r2Service";
import { coursesRepository } from "../repository/coursesRepository";
import { PaginationReqExtended } from "api/middleware/pagination";
import { GetAllCoursesReq } from "@repo/contract";

function withThumbnailUrl<T extends { thumbnailObjectKey: string | null }>(course: T) {
  const { thumbnailObjectKey, ...rest } = course;
  return {
    ...rest,
    thumbnailUrl: thumbnailObjectKey ? r2Service.publicUrl(thumbnailObjectKey) : null,
  };
}

async function getOwnedCourse(courseId: string, authUserId: string) {
  const user = await usersRepository.getUserByAuthUserId(authUserId);
  const course = await coursesRepository.getCourseById(courseId);
  if (!course) {
    throw new NotFoundError({ code: ErrorCodeCourse.NOT_FOUND });
  }
  if (!user || course.creatorId !== user.id) {
    throw new ForbiddenError({ code: ErrorCode.FORBIDDEN });
  }
  return course;
}

export const coursesService = {
  assertOwnedCourse: getOwnedCourse,

  getAllCourses: async (
    authUserId: string,
    dto: GetAllCoursesReq<PaginationReqExtended>
  ): Promise<GetAllCoursesRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) throw new NotFoundError({ code: ErrorCodeCourse.NOT_FOUND });
    const courses = await coursesRepository.getAllCourses({ ...dto, creatorId: user.id });
    return { ...courses, data: courses.data.map(withThumbnailUrl) };
  },

  getCourse: async (id: string): Promise<GetCourseRes> => {
    const course = await coursesRepository.getCourseById(id);
    return course ? withThumbnailUrl(course) : undefined;
  },

  getCourseByPublicId: async (publicId: string): Promise<GetCourseByPublicIdRes> => {
    const course = await coursesRepository.getCourseByPublicId(publicId);
    return course ? withThumbnailUrl(course) : undefined;
  },

  getAllPublicCourses: async (
    dto: GetAllPublicCoursesReq<PaginationReqExtended>
  ): Promise<GetAllPublicCoursesRes> => {
    const courses = await coursesRepository.getAllPublishedCourses({ ...dto });
    return { ...courses, data: courses.data.map(withThumbnailUrl) };
  },

  // Not-enrolled learners only see topic/lesson names, never description content
  getPublicCourseTopics: async (publicId: string): Promise<GetPublicTopicsRes> => {
    const course = await coursesRepository.getCourseByPublicId(publicId);
    if (!course || course.status !== "published") {
      throw new NotFoundError({ code: ErrorCodeCourse.NOT_FOUND });
    }
    const topics = await topicsRepository.getTopicsByCourseId(course.id);
    return topics.map(({ id, courseId, name, position }) => ({ id, courseId, name, position }));
  },

  getPublicCourseLessons: async (publicId: string): Promise<GetPublicLessonsRes> => {
    const course = await coursesRepository.getCourseByPublicId(publicId);
    if (!course || course.status !== "published") {
      throw new NotFoundError({ code: ErrorCodeCourse.NOT_FOUND });
    }
    const lessons = await lessonsRepository.getLessonsByCourseId(course.id);
    return lessons.map(({ id, topicId, name, position }) => ({ id, topicId, name, position }));
  },

  createCourse: async (authUserId: string, data: CreateCourseReq): Promise<CreateCourseRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) throw new NotFoundError({ code: ErrorCodeCourse.NOT_FOUND });

    return withThumbnailUrl(await coursesRepository.createCourse({ ...data, creatorId: user.id }));
  },

  updateCourse: async (
    id: string,
    data: UpdateCourseReq,
    authUserId: string
  ): Promise<UpdateCourseRes> => {
    const existing = await getOwnedCourse(id, authUserId);

    const course = await coursesRepository.updateCourse(id, data);
    if (course && existing.status !== "published" && course.status === "published") {
      void notificationsService.notifyCreatorNewCourse(course).catch(() => undefined);
    } else if (course && existing.status === "published") {
      void notificationsService.notifyCourseUpdated(course).catch(() => undefined);
    }
    return course ? withThumbnailUrl(course) : undefined;
  },

  deleteCourse: async (id: string, authUserId: string): Promise<DeleteCourseRes> => {
    const existing = await getOwnedCourse(id, authUserId);
    await documentsService.deleteForCourse(id);
    if (existing.thumbnailObjectKey) {
      await r2Service.deleteObject(existing.thumbnailObjectKey);
    }
    const course = await coursesRepository.deleteCourse(id);
    return course ? withThumbnailUrl(course) : undefined;
  },

  getOwnedCourseTree: async (
    { courseId, publicId }: GetCourseTreeInput,
    authUserId: string
  ): Promise<CourseTree> => {
    const id = courseId ?? (await coursesRepository.getCourseByPublicId(publicId!))?.id;
    if (!id) {
      throw new NotFoundError({ code: ErrorCodeCourse.NOT_FOUND });
    }
    await getOwnedCourse(id, authUserId);
    const tree = await coursesRepository.getCourseTree(id);
    if (!tree) {
      throw new NotFoundError({ code: ErrorCodeCourse.NOT_FOUND });
    }
    return tree;
  },

  // Always a draft, so AI-created courses never trigger publish notifications
  createCourseDraft: async (
    data: CreateCourseDraftInput,
    authUserId: string
  ): Promise<CourseTree> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) {
      throw new NotFoundError({ code: ErrorCodeCourse.NOT_FOUND });
    }
    return await coursesRepository.createCourseTree({ ...data, creatorId: user.id });
  },

  initializeThumbnailUpload: async (
    dto: InitializeCourseThumbnailUploadReq,
    authUserId: string
  ): Promise<InitializeCourseThumbnailUploadRes> => {
    await getOwnedCourse(dto.courseId, authUserId);
    const objectKey = `course-hub/${authUserId}/course-content/thumbnail/${dto.courseId}/${crypto.randomUUID()}`;
    const uploadUrl = await r2Service.createUploadUrl(objectKey, dto.mimeType);
    return { objectKey, uploadUrl, requiredHeaders: { "Content-Type": dto.mimeType } };
  },

  completeThumbnailUpload: async (
    dto: CompleteCourseThumbnailUploadReq,
    authUserId: string
  ): Promise<void> => {
    const course = await getOwnedCourse(dto.courseId, authUserId);
    const prefix = `course-hub/${authUserId}/course-content/thumbnail/${dto.courseId}/`;
    if (!dto.objectKey.startsWith(prefix)) {
      throw new ForbiddenError({ code: ErrorCode.FORBIDDEN });
    }
    try {
      const object = await r2Service.headObject(dto.objectKey);
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(object.ContentType ?? "") ||
        !object.ContentLength ||
        object.ContentLength > 10 * 1024 * 1024
      ) {
        throw new BadRequestError({ code: ErrorCode.VALIDATION_ERROR });
      }
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError({ code: ErrorCode.VALIDATION_ERROR });
    }
    await coursesRepository.setThumbnailObjectKey(dto.courseId, dto.objectKey);
    if (course.thumbnailObjectKey) {
      await r2Service.deleteObject(course.thumbnailObjectKey);
    }
  },

  deleteThumbnail: async (courseId: string, authUserId: string): Promise<void> => {
    const course = await getOwnedCourse(courseId, authUserId);
    if (course.thumbnailObjectKey) {
      await r2Service.deleteObject(course.thumbnailObjectKey);
    }
    await coursesRepository.setThumbnailObjectKey(courseId, null);
  },
};
