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
  UpdateUserPreferencesReq,
  UpdateUserPreferencesRes,
} from "@repo/contract";
import { Request, Response } from "express";
import { usersService } from "../services/usersService";
import { PaginationReqExtended } from "api/middleware/pagination";

export const usersController = {
  getSelf: async (res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const user: User = await usersService.getByAuthUserId(authUserId);
    res.json(user);
  },
  getUserPreferences: async (res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const preferences: UpdateUserPreferencesRes = await usersService.getUserPreferences(authUserId);
    res.json(preferences);
  },
  updateUserPreferences: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const reqDto = res.locals.body as UpdateUserPreferencesReq;
    const preferences: UpdateUserPreferencesRes = await usersService.updateUserPreferences(
      authUserId,
      reqDto
    );
    res.json(preferences);
  },
  getAllUsers: async (_req: Request, res: Response): Promise<void> => {
    const dto: GetAllUsersReq<PaginationReqExtended> = {
      ...res.locals.pagination,
      query: res.locals.query.query,
      role: res.locals.query.role,
      requiresFileUpload: res.locals.query.requiresFileUpload,
    };

    const users: GetAllUsersRes = await usersService.getAllUsersWithProfiles(dto);
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
