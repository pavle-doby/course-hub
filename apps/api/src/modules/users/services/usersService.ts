import {
  CreateUserReq,
  CreateUserRes,
  DeleteUserRes,
  ErrorCodeUser,
  GetAllUsersReq,
  GetAllUsersRes,
  GetUserRes,
  UpdateUserReq,
  UpdateUserRes,
  User,
} from "@repo/contract";
import { NotFoundError, ConflictError } from "@repo/contract";
import { usersRepository } from "../repository/usersRepository";
import { PaginationReqExtended } from "api/middleware/pagination";

export const usersService = {
  getByAuthUserId: async (authUserId: string): Promise<User> => {
    const userDb = await usersRepository.getUserByAuthUserId(authUserId);

    if (!userDb) {
      throw new NotFoundError({ code: ErrorCodeUser.NOT_FOUND });
    }

    const user: User = {
      id: userDb.id,
      email: userDb.email,
      firstName: userDb.firstName,
      lastName: userDb.lastName,
      username: userDb.username,
      avatarUrl: userDb.avatarUrl,
      bio: userDb.bio,
      role: userDb.role,
    };

    return user;
  },
  getAllUsersWithProfiles: async (
    dto: GetAllUsersReq<PaginationReqExtended>
  ): Promise<GetAllUsersRes> => {
    return await usersRepository.getAllUsersWithProfiles(dto);
  },
  getUserWithProfile: async (id: string): Promise<GetUserRes> => {
    return await usersRepository.getUserWithProfile(id);
  },
  createUser: async (user: CreateUserReq): Promise<CreateUserRes> => {
    const existingUser = await usersRepository.getUserByAuthUserId(user.authUserId);

    if (existingUser) {
      throw new ConflictError({ code: ErrorCodeUser.ALREADY_EXISTS });
    }

    const [userRes] = await usersRepository.createUser(user);
    return userRes;
  },
  updateUser: async (id: string, user: UpdateUserReq): Promise<UpdateUserRes> => {
    const existingUser = await usersRepository.getUserWithProfile(id);

    if (!existingUser) {
      throw new NotFoundError({ code: ErrorCodeUser.NOT_FOUND });
    }

    const [userRes] = await usersRepository.updateUser(id, user);
    return userRes;
  },
  deleteUser: async (id: string): Promise<DeleteUserRes> => {
    const [user] = await usersRepository.deleteUser(id);
    return user;
  },
};
