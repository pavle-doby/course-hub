import {
  CreateCourseReq,
  CreateCourseRes,
  DeleteCourseRes,
  ErrorCodeCourse,
  GetAllCoursesRes,
  GetAllPublicCoursesReq,
  GetAllPublicCoursesRes,
  GetCourseByPublicIdRes,
  GetCourseRes,
  GetPublicLessonsRes,
  GetPublicTopicsRes,
  UpdateCourseReq,
  UpdateCourseRes,
} from "@repo/contract";
import { NotFoundError } from "@repo/contract";
import { usersRepository } from "api/modules/users/repository/usersRepository";
import { topicsRepository } from "api/modules/topics/repository/topicsRepository";
import { lessonsRepository } from "api/modules/lessons/repository/lessonsRepository";
import { coursesRepository } from "../repository/coursesRepository";
import { PaginationReqExtended } from "api/middleware/pagination";
import { GetAllCoursesReq } from "@repo/contract";

export const coursesService = {
  getAllCourses: async (
    authUserId: string,
    dto: GetAllCoursesReq<PaginationReqExtended>
  ): Promise<GetAllCoursesRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) throw new NotFoundError({ code: ErrorCodeCourse.NOT_FOUND });
    return await coursesRepository.getAllCourses({ ...dto, creatorId: user.id });
  },

  getCourse: async (id: string): Promise<GetCourseRes> => {
    return await coursesRepository.getCourseById(id);
  },

  getCourseByPublicId: async (publicId: string): Promise<GetCourseByPublicIdRes> => {
    return await coursesRepository.getCourseByPublicId(publicId);
  },

  getAllPublicCourses: async (
    dto: GetAllPublicCoursesReq<PaginationReqExtended>
  ): Promise<GetAllPublicCoursesRes> => {
    return await coursesRepository.getAllPublishedCourses({ ...dto });
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

    return await coursesRepository.createCourse({ ...data, creatorId: user.id });
  },

  updateCourse: async (id: string, data: UpdateCourseReq): Promise<UpdateCourseRes> => {
    const existing = await coursesRepository.getCourseById(id);
    if (!existing) throw new NotFoundError({ code: ErrorCodeCourse.NOT_FOUND });

    return await coursesRepository.updateCourse(id, data);
  },

  deleteCourse: async (id: string): Promise<DeleteCourseRes> => {
    const existing = await coursesRepository.getCourseById(id);
    if (!existing) throw new NotFoundError({ code: ErrorCodeCourse.NOT_FOUND });
    return await coursesRepository.deleteCourse(id);
  },
};
