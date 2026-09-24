import {
  CompleteCourseThumbnailUploadReq,
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
  InitializeCourseThumbnailUploadReq,
  InitializeCourseThumbnailUploadRes,
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
      excludeEnrolled: res.locals.query?.excludeEnrolled,
      showAllCreators: res.locals.query?.showAllCreators,
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
    const authUserId: string = res.locals.user.id;
    const resDto: UpdateCourseRes = await coursesService.updateCourse(id, reqDto, authUserId);
    res.status(200).json(resDto);
  },

  deleteCourse: async (_req: Request, res: Response): Promise<void> => {
    const { id } = res.locals.params as { id: string };
    const authUserId: string = res.locals.user.id;
    const resDto: DeleteCourseRes = await coursesService.deleteCourse(id, authUserId);
    res.status(200).json(resDto);
  },

  initializeThumbnailUpload: async (_req: Request, res: Response): Promise<void> => {
    const dto = res.locals.body as InitializeCourseThumbnailUploadReq;
    const thumbnail: InitializeCourseThumbnailUploadRes =
      await coursesService.initializeThumbnailUpload(dto, res.locals.user.id);
    res.status(201).json(thumbnail);
  },

  completeThumbnailUpload: async (_req: Request, res: Response): Promise<void> => {
    const dto = res.locals.body as CompleteCourseThumbnailUploadReq;
    await coursesService.completeThumbnailUpload(dto, res.locals.user.id);
    res.status(204).send();
  },

  deleteThumbnail: async (_req: Request, res: Response): Promise<void> => {
    const { id } = res.locals.params as { id: string };
    await coursesService.deleteThumbnail(id, res.locals.user.id);
    res.status(204).send();
  },
};
