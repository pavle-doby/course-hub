import {
  EnrollCourseReq,
  EnrollCourseRes,
  GetAllEnrolledCoursesRes,
  GetAllEnrolledCoursesReq,
  GetEnrolledCourseLessonsRes,
  GetEnrolledCourseTopicsRes,
  GetEnrollmentStatusRes,
  WithdrawFromCourseRes,
} from "@repo/contract";
import { Request, Response } from "express";
import { PaginationReqExtended } from "api/middleware/pagination";
import { enrollmentsService } from "../services/enrollmentsService";

export const enrollmentsController = {
  enrollInCourse: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const { publicId } = res.locals.body as EnrollCourseReq;
    const resDto: EnrollCourseRes = await enrollmentsService.enrollInCourse(authUserId, publicId);
    res.status(201).json(resDto);
  },

  getEnrollmentStatus: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const { publicId } = res.locals.params as { publicId: string };
    const resDto: GetEnrollmentStatusRes = await enrollmentsService.getEnrollmentStatus(
      authUserId,
      publicId
    );
    res.status(200).json(resDto);
  },

  withdrawFromCourse: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const { publicId } = res.locals.params as { publicId: string };
    const resDto: WithdrawFromCourseRes = await enrollmentsService.withdrawFromCourse(
      authUserId,
      publicId
    );
    res.status(200).json(resDto);
  },

  getEnrolledCourseTopics: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const { publicId } = res.locals.params as { publicId: string };
    const topics: GetEnrolledCourseTopicsRes = await enrollmentsService.getEnrolledCourseTopics(
      authUserId,
      publicId
    );
    res.status(200).json(topics);
  },

  getEnrolledCourseLessons: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const { publicId } = res.locals.params as { publicId: string };
    const lessons: GetEnrolledCourseLessonsRes = await enrollmentsService.getEnrolledCourseLessons(
      authUserId,
      publicId
    );
    res.status(200).json(lessons);
  },

  getAllEnrolledCourses: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const dto: GetAllEnrolledCoursesReq<PaginationReqExtended> = {
      ...res.locals.pagination,
      query: res.locals.query?.query,
    };
    const courses: GetAllEnrolledCoursesRes = await enrollmentsService.getAllEnrolledCourses(
      authUserId,
      dto
    );
    res.status(200).json(courses);
  },
};
