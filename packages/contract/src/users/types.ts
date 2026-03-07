import { UserEntity } from "@repo/db-schema";
import { PaginationReq, PaginationRes, Search } from "../shared";

export type User = Omit<UserEntity, "createdAt" | "updatedAt" | "lastLogin">;

export type UserExtended = User & {};

export type UserStatus = UserEntity["status"];
export type UserRole = UserEntity["role"];

export type FilterUser = {
  status?: UserStatus;
  role?: UserRole;
  requiresFileUpload?: boolean;
};

// GET /users → get all users
export type GetAllUsersReq<Pagination = PaginationReq> = Pagination &
  Partial<Search & FilterUser>;
export type GetAllUsersRes = PaginationRes<UserExtended>;

// GET /users/:id → get user by id
export type GetUserReq = Pick<User, "id">;
export type GetUserRes = UserExtended | undefined;

// POST /users → create new user
export type CreateUserReq = Omit<User, "id">;
export type CreateUserRes = User;

// PUT /users/:id → update user by id
export type UpdateUserReq = Partial<Omit<User, "id">>;
export type UpdateUserRes = User | undefined;

// DELETE /users/:id → delete user by id
export type DeleteUserRes = UserEntity | undefined;
