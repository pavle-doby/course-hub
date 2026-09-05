import {
  ConflictError,
  ErrorCodeEnrollment,
  EnrollCourseRes,
  GetAllEnrolledCoursesRes,
  GetAllEnrolledCoursesReq,
  GetAllStudentsRes,
  GetAllStudentsReq,
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
import { PaginationReqExtended } from "api/middleware/pagination";
import { enrollmentsRepository } from "../repository/enrollmentsRepository";

async function getPublishedCourseOrThrow(publicId: string) {
  const course = await coursesRepository.getCourseByPublicId(publicId);
  if (!course || course.status !== "published") {
    throw new NotFoundError({ code: ErrorCodeEnrollment.COURSE_NOT_FOUND });
  }
  return course;
}

export const enrollmentsService = {
  enrollInCourse: async (authUserId: string, publicId: string): Promise<EnrollCourseRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) throw new NotFoundError({ code: ErrorCodeEnrollment.COURSE_NOT_FOUND });

    const course = await getPublishedCourseOrThrow(publicId);

    const existing = await enrollmentsRepository.getEnrollment(user.id, course.id);
    if (existing && !existing.withdrawnAt) {
      throw new ConflictError({ code: ErrorCodeEnrollment.ALREADY_ENROLLED });
    }
    if (existing) return await enrollmentsRepository.reactivateEnrollment(existing.id);

    return await enrollmentsRepository.createEnrollment(user.id, course.id);
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

    return await enrollmentsRepository.getEnrolledCourses({ ...dto, userId: user.id });
  },

  getAllStudents: async (
    authUserId: string,
    dto: GetAllStudentsReq<PaginationReqExtended>
  ): Promise<GetAllStudentsRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) throw new NotFoundError({ code: ErrorCodeEnrollment.COURSE_NOT_FOUND });

    return await enrollmentsRepository.getStudents({ ...dto, creatorId: user.id });
  },
};
