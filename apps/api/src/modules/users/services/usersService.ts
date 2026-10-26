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
  UpdateUserPreferencesReq,
  UpdateUserPreferencesRes,
  UpdateUserPlanReq,
  User,
} from "@repo/contract";
import {
  BadRequestError,
  CURRENT_PLAN_VERSION,
  ErrorCode,
  ErrorCodePlans,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  PLAN_ENTITLEMENTS,
} from "@repo/contract";
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
      plan: userDb.plan,
      planVersion: userDb.planVersion,
    };

    return user;
  },
  getByEmail: async (email: string): Promise<User> => {
    const userDb = await usersRepository.getByEmail(email);

    if (!userDb) {
      throw new NotFoundError({ code: ErrorCodeUser.NOT_FOUND });
    }

    return {
      id: userDb.id,
      email: userDb.email,
      firstName: userDb.firstName,
      lastName: userDb.lastName,
      username: userDb.username,
      avatarUrl: userDb.avatarUrl,
      bio: userDb.bio,
      role: userDb.role,
      plan: userDb.plan,
      planVersion: userDb.planVersion,
    };
  },
  getUserPreferences: async (authUserId: string): Promise<UpdateUserPreferencesRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    const preferences = user && (await usersRepository.getUserPreferences(user.id));

    if (!preferences) {
      throw new NotFoundError({ code: ErrorCodeUser.NOT_FOUND });
    }

    return preferences;
  },
  updateUserPreferences: async (
    authUserId: string,
    data: UpdateUserPreferencesReq
  ): Promise<UpdateUserPreferencesRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    const preferences = user && (await usersRepository.updateUserPreferences(user.id, data));

    if (!preferences) {
      throw new NotFoundError({ code: ErrorCodeUser.NOT_FOUND });
    }

    return preferences;
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

    if (!userRes) {
      throw new InternalServerError();
    }

    return userRes;
  },
  updateUser: async (
    id: string,
    user: UpdateUserReq,
    authUserId: string
  ): Promise<UpdateUserRes> => {
    // Users edit only themselves; admins edit anyone and are the only ones who can change a role
    const caller = await usersRepository.getUserByAuthUserId(authUserId);
    const isAdmin = caller?.role === "admin";
    if (!caller || (caller.id !== id && !isAdmin) || (user.role !== undefined && !isAdmin)) {
      throw new ForbiddenError({ code: ErrorCode.FORBIDDEN });
    }

    const existingUser = await usersRepository.getUserWithProfile(id);

    if (!existingUser) {
      throw new NotFoundError({ code: ErrorCodeUser.NOT_FOUND });
    }

    const [userRes] = await usersRepository.updateUser(id, user);
    return userRes;
  },
  // Admin only until payments exist; then the payment webhook sets the plan
  updateUserPlan: async (id: string, dto: UpdateUserPlanReq): Promise<User> => {
    const planVersion = dto.planVersion ?? CURRENT_PLAN_VERSION;
    if (!(planVersion in PLAN_ENTITLEMENTS[dto.plan])) {
      throw new BadRequestError({ code: ErrorCodePlans.INVALID_PLAN_VERSION });
    }

    const user = await usersRepository.updateUserPlan(id, dto.plan, planVersion);
    if (!user) {
      throw new NotFoundError({ code: ErrorCodeUser.NOT_FOUND });
    }
    return user;
  },
  deleteUser: async (id: string): Promise<DeleteUserRes> => {
    const [user] = await usersRepository.deleteUser(id);
    return user;
  },
};
