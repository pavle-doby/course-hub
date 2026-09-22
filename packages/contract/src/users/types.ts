import { z } from "zod";
import { UserEntity } from "@repo/db-schema";
import { PaginationReq, PaginationRes, Search } from "../shared";
import {
  UserGetAllQuerySchema,
  UserPostQuerySchema,
  UserPreferencesPutQuerySchema,
  UserPreferencesSchema,
  UserPutQuerySchema,
  UserSchema,
} from "./schemas";

export type User = z.infer<typeof UserSchema>;

export type UserExtended = User & {};

export type UserRole = UserEntity["role"];

export type FilterUser = {
  role?: UserRole;
  requiresFileUpload?: boolean;
};

// GET /users → get all users
export type GetAllUsersReq<Pagination = PaginationReq> = Pagination &
  Partial<Search> &
  z.infer<typeof UserGetAllQuerySchema>;
export type GetAllUsersRes = PaginationRes<UserExtended>;

// GET /users/:id → get user by id
export type GetUserReq = Pick<User, "id">;
export type GetUserRes = UserExtended | undefined;

// POST /users → create new user
export type CreateUserReq = z.infer<typeof UserPostQuerySchema>;
export type CreateUserRes = User;

// PUT /users/:id → update user by id
export type UpdateUserReq = z.infer<typeof UserPutQuerySchema>;
export type UpdateUserRes = User | undefined;

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type UpdateUserPreferencesReq = z.infer<typeof UserPreferencesPutQuerySchema>;
export type UpdateUserPreferencesRes = UserPreferences;

// DELETE /users/:id → delete user by id
export type DeleteUserRes = User | undefined;
