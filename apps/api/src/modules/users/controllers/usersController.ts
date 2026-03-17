import {
  User,
  CreateUserReq,
  CreateUserRes,
  DeleteUserRes,
  GetAllUsersReq,
  GetAllUsersRes,
  GetUserRes,
  UpdateUserReq,
  UpdateUserRes,
} from "@my/contract";
import { Request, Response } from "express";
import { usersService } from "../services/usersService";
import { PaginationReqExtended } from "api/middleware/pagination";

export const usersController = {
  getSelf: async (res: Response): Promise<void> => {
    const email: string = res.locals?.user?.email;
    const user: User = await usersService.getByEmail(email);
    res.json(user);
  },
  getAllUsers: async (_req: Request, res: Response): Promise<void> => {
    const dto: GetAllUsersReq<PaginationReqExtended> = {
      ...res.locals.pagination,
      query: res.locals.query.query,
      status: res.locals.query.status,
      role: res.locals.query.role,
      requiresFileUpload: res.locals.query.requiresFileUpload,
    };

    const users: GetAllUsersRes =
      await usersService.getAllUsersWithProfiles(dto);
    res.status(200).json(users);
  },

  getUser: async (_req: Request, res: Response): Promise<void> => {
    const reqDto = res.locals.params as { id: string };
    const resDto: GetUserRes = await usersService.getUserWithProfile(reqDto.id);
    res.status(200).json(resDto);
  },

  createUser: async (_req: Request, res: Response): Promise<void> => {
    const reqDto = res.locals.body as CreateUserReq;
    const resDto: CreateUserRes = await usersService.createUser(reqDto);
    res.status(201).json(resDto);
  },

  updateUser: async (_req: Request, res: Response): Promise<void> => {
    const id = res.locals.params.id;
    const reqDto = res.locals.body as UpdateUserReq;
    const resDto: UpdateUserRes = await usersService.updateUser(id, reqDto);
    res.status(200).json(resDto);
  },

  deleteUser: async (_req: Request, res: Response): Promise<void> => {
    const id = res.locals.params.id;
    const resDto: DeleteUserRes = await usersService.deleteUser(id);
    res.status(200).json(resDto);
  },
};
