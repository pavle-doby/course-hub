import {
  ConflictError,
  ErrorCodeEnrollment,
  EnrollCourseRes,
  GetAllEnrolledCoursesRes,
  GetAllEnrolledCoursesReq,
  GetAllStudentsRes,
  GetAllStudentsReq,
  GetEnrollmentsStatsRes,
  GetEnrolledCourseLessonsRes,
  GetEnrolledCourseTopicsRes,
  GetEnrollmentStatusRes,
  NotFoundError,
  WithdrawFromCourseRes,
} from "@repo/contract";
import { usersRepository } from "api/modules/users/repository/usersRepository";
import { coursesRepository } from "api/modules/courses/repository/coursesRepository";
import { topicsRepository } from "api/modules/topics/repository/topicsRepository";
import { lessonsRepository } from "api/modules/lessons/repository/lessonsRepository";
import { r2Service } from "api/modules/documents/services/r2Service";
import { PaginationReqExtended } from "api/middleware/pagination";
import { enrollmentsRepository } from "../repository/enrollmentsRepository";
import { notificationsService } from "api/modules/notifications/services/notificationsService";

async function getPublishedCourseOrThrow(publicId: string) {
  const course = await coursesRepository.getCourseByPublicId(publicId);
  if (!course || course.status !== "published") {
    throw new NotFoundError({ code: ErrorCodeEnrollment.COURSE_NOT_FOUND });
  }
  return course;
}

export const enrollmentsService = {
  // Private courses can only be joined via an accepted invitation, never self-enrolled.
  enrollInCourse: async (authUserId: string, publicId: string): Promise<EnrollCourseRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) throw new NotFoundError({ code: ErrorCodeEnrollment.COURSE_NOT_FOUND });

    const course = await getPublishedCourseOrThrow(publicId);
    if (course.visibility === "private") {
      void notificationsService
        .notifyPrivateCourseAttempt(course, user.email)
        .catch(() => undefined);
      throw new ConflictError({ code: ErrorCodeEnrollment.COURSE_PRIVATE });
    }

    const existing = await enrollmentsRepository.getEnrollment(user.id, course.id);
    if (existing && !existing.withdrawnAt) {
      throw new ConflictError({ code: ErrorCodeEnrollment.ALREADY_ENROLLED });
    }
    if (existing) {
      const enrollment = await enrollmentsRepository.reactivateEnrollment(existing.id);
      void notificationsService.notifyCourseEnrolled(course, user.email).catch(() => undefined);
      return enrollment;
    }

    const enrollment = await enrollmentsRepository.createEnrollment(user.id, course.id);
    void notificationsService.notifyCourseEnrolled(course, user.email).catch(() => undefined);
    return enrollment;
  },

  withdrawFromCourse: async (
    authUserId: string,
    publicId: string
  ): Promise<WithdrawFromCourseRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) throw new NotFoundError({ code: ErrorCodeEnrollment.COURSE_NOT_FOUND });

    const course = await getPublishedCourseOrThrow(publicId);

    const existing = await enrollmentsRepository.getEnrollment(user.id, course.id);
    if (!existing || existing.withdrawnAt) {
      throw new NotFoundError({ code: ErrorCodeEnrollment.NOT_ENROLLED });
    }

    const enrollment = await enrollmentsRepository.withdrawEnrollment(user.id, course.id);
    return enrollment!;
  },

  getEnrollmentStatus: async (
    authUserId: string,
    publicId: string
  ): Promise<GetEnrollmentStatusRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) throw new NotFoundError({ code: ErrorCodeEnrollment.COURSE_NOT_FOUND });

    const course = await getPublishedCourseOrThrow(publicId);
    const enrollment = await enrollmentsRepository.getEnrollment(user.id, course.id);
    return { enrolled: !!enrollment && !enrollment.withdrawnAt };
  },

  getEnrolledCourseTopics: async (
    authUserId: string,
    publicId: string
  ): Promise<GetEnrolledCourseTopicsRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) throw new NotFoundError({ code: ErrorCodeEnrollment.COURSE_NOT_FOUND });

    const course = await getPublishedCourseOrThrow(publicId);
    const enrollment = await enrollmentsRepository.getEnrollment(user.id, course.id);
    if (!enrollment || enrollment.withdrawnAt) {
      throw new NotFoundError({ code: ErrorCodeEnrollment.NOT_ENROLLED });
    }

    return await topicsRepository.getTopicsByCourseId(course.id);
  },

  getEnrolledCourseLessons: async (
    authUserId: string,
    publicId: string
  ): Promise<GetEnrolledCourseLessonsRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) throw new NotFoundError({ code: ErrorCodeEnrollment.COURSE_NOT_FOUND });

    const course = await getPublishedCourseOrThrow(publicId);
    const enrollment = await enrollmentsRepository.getEnrollment(user.id, course.id);
    if (!enrollment || enrollment.withdrawnAt) {
      throw new NotFoundError({ code: ErrorCodeEnrollment.NOT_ENROLLED });
    }

    return await lessonsRepository.getLessonsByCourseId(course.id);
  },

  getAllEnrolledCourses: async (
    authUserId: string,
    dto: GetAllEnrolledCoursesReq<PaginationReqExtended>
  ): Promise<GetAllEnrolledCoursesRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) throw new NotFoundError({ code: ErrorCodeEnrollment.COURSE_NOT_FOUND });

    const courses = await enrollmentsRepository.getEnrolledCourses({ ...dto, userId: user.id });
    return {
      ...courses,
      data: courses.data.map(
        ({ thumbnailObjectKey, lessonsCount, doneLessonsCount, ...course }) => ({
          ...course,
          thumbnailUrl: thumbnailObjectKey ? r2Service.publicUrl(thumbnailObjectKey) : null,
          progressPercent:
            lessonsCount > 0 ? Math.round((doneLessonsCount / lessonsCount) * 100) : 0,
        })
      ),
    };
  },

  getAllStudents: async (
    authUserId: string,
    dto: GetAllStudentsReq<PaginationReqExtended>
  ): Promise<GetAllStudentsRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) throw new NotFoundError({ code: ErrorCodeEnrollment.COURSE_NOT_FOUND });

    return await enrollmentsRepository.getStudents({ ...dto, creatorId: user.id });
  },

  getStats: async (authUserId: string): Promise<GetEnrollmentsStatsRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) throw new NotFoundError({ code: ErrorCodeEnrollment.COURSE_NOT_FOUND });

    return await enrollmentsRepository.getStats(user.id);
  },
};
