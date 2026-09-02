import {
  CreateCourseReq,
  CreateCourseRes,
  DeleteCourseRes,
  GetAllCoursesReq,
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
import { Request, Response } from "express";
import { coursesService } from "../services/coursesService";
import { PaginationReqExtended } from "api/middleware/pagination";

export const coursesController = {
  getAllCourses: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const dto: GetAllCoursesReq<PaginationReqExtended> = {
      ...res.locals.pagination,
      query: res.locals.query?.query,
      status: res.locals.query?.status,
    };
    const courses: GetAllCoursesRes = await coursesService.getAllCourses(authUserId, dto);
    res.status(200).json(courses);
  },

  getCourse: async (_req: Request, res: Response): Promise<void> => {
    const { id } = res.locals.params as { id: string };
    const course: GetCourseRes = await coursesService.getCourse(id);
    res.status(200).json(course);
  },

  getCourseByPublicId: async (_req: Request, res: Response): Promise<void> => {
    const { publicId } = res.locals.params as { publicId: string };
    const course: GetCourseByPublicIdRes = await coursesService.getCourseByPublicId(publicId);
    res.status(200).json(course);
  },

  getAllPublicCourses: async (_req: Request, res: Response): Promise<void> => {
    const dto: GetAllPublicCoursesReq<PaginationReqExtended> = {
      ...res.locals.pagination,
      query: res.locals.query?.query,
    };
    const courses: GetAllPublicCoursesRes = await coursesService.getAllPublicCourses(dto);
    res.status(200).json(courses);
  },

  getPublicCourseTopics: async (_req: Request, res: Response): Promise<void> => {
    const { publicId } = res.locals.params as { publicId: string };
    const topics: GetPublicTopicsRes = await coursesService.getPublicCourseTopics(publicId);
    res.status(200).json(topics);
  },

  getPublicCourseLessons: async (_req: Request, res: Response): Promise<void> => {
    const { publicId } = res.locals.params as { publicId: string };
    const lessons: GetPublicLessonsRes = await coursesService.getPublicCourseLessons(publicId);
    res.status(200).json(lessons);
  },

  createCourse: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const reqDto = res.locals.body as CreateCourseReq;
    const resDto: CreateCourseRes = await coursesService.createCourse(authUserId, reqDto);
    res.status(201).json(resDto);
  },

  updateCourse: async (_req: Request, res: Response): Promise<void> => {
    const { id } = res.locals.params as { id: string };
    const reqDto = res.locals.body as UpdateCourseReq;
    const resDto: UpdateCourseRes = await coursesService.updateCourse(id, reqDto);
    res.status(200).json(resDto);
  },

  deleteCourse: async (_req: Request, res: Response): Promise<void> => {
    const { id } = res.locals.params as { id: string };
    const resDto: DeleteCourseRes = await coursesService.deleteCourse(id);
    res.status(200).json(resDto);
  },
};
