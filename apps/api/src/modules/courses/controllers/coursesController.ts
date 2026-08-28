import {
  CreateCourseReq,
  CreateCourseRes,
  DeleteCourseRes,
  GetAllCoursesReq,
  GetAllCoursesRes,
  GetCourseRes,
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
