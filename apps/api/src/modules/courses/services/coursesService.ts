import {
  CreateCourseReq,
  CreateCourseRes,
  DeleteCourseRes,
  ErrorCodeCourse,
  GetAllCoursesRes,
  GetCourseRes,
  UpdateCourseReq,
  UpdateCourseRes,
} from "@repo/contract";
import { NotFoundError } from "@repo/contract";
import { usersRepository } from "api/modules/users/repository/usersRepository";
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
