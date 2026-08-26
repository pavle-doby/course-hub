import { Request, Response } from "express";
import {
  ErrorCodeAuth,
  ErrorCode,
  AuthLogInUserReq,
  AuthLogInUserRes,
  AuthSignUpUserReq,
  AuthSignUpUserRes,
  AuthNativeSignUpUserRes,
  AuthNativeLogInUserRes,
  AuthNativeRefreshTokenReq,
  AuthNativeRefreshTokenRes,
} from "@repo/contract";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
  TooManyRequestsError,
} from "@repo/contract";
import { supabase } from "api/utils/supabase";
import { authRepository } from "../repository/authRepository";
import { CreateUser } from "../repository/types";
import { setAuthTokens } from "../utils/setAuthTokens";

export const authService = {
  signUp: async ({
    dto,
    res,
  }: {
    dto: AuthSignUpUserReq;
    res: Response;
  }): Promise<AuthSignUpUserRes> => {
    const { data, error } = await supabase.auth.signUp({
      email: dto.email,
      password: dto.password,
    });

    // Handle Supabase auth errors
    if (error) {
      if (error.status === 429) {
        throw new TooManyRequestsError({
          code: ErrorCodeAuth.RATE_LIMIT_EXCEEDED,
          error,
        });
      }

      throw new BadRequestError({
        code: error.code || ErrorCodeAuth.BAD_REQUEST,
        error: error,
      });
    }

    const authUserId = data.user!.id;
    const username = `${dto.email.split("@")[0]}_${Math.random().toString(36).slice(2, 8)}`;

    const user: CreateUser = {
      authUserId,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      username,
      role: "user",
    };

    const existingUser = await authRepository.getUserByAuthUserId(authUserId);

    if (existingUser) {
      throw new ConflictError({
        code: ErrorCodeAuth.USER_EXISTS,
      });
    }

    const userDb = await authRepository.createUser(user);

    if (!userDb) throw new InternalServerError({ code: ErrorCode.SERVER_ERROR });

    const userDto: AuthSignUpUserRes = {
      id: userDb.id,
      email: userDb.email,
      firstName: userDb.firstName,
      lastName: userDb.lastName,
      username: userDb.username,
      avatarUrl: userDb.avatarUrl,
      bio: userDb.bio,
      role: userDb.role,
    };

    setAuthTokens({
      res,
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
    });

    return userDto;
  },

  logIn: async ({
    dto,
    res,
  }: {
    dto: AuthLogInUserReq;
    res: Response;
  }): Promise<AuthLogInUserRes> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    // Handle Supabase auth errors
    if (error) {
      throw new BadRequestError({
        code: ErrorCodeAuth.INVALID_CREDENTIALS,
        error,
      });
    }

    // Set tokens in cookies
    setAuthTokens({
      res,
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
    });

    const user = await authRepository.getUserByAuthUserId(data.user.id);

    if (!user) {
      throw new NotFoundError({
        code: ErrorCodeAuth.USER_NOT_FOUND,
      });
    }

    const userDto: AuthLogInUserRes = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      role: user.role,
    };

    return userDto;
  },

  signOut: async ({ req, res }: { req: Request; res: Response }) => {
    // Get token from cookie
    const token = req.cookies.access_token;

    if (token) {
      // Sign out from Supabase
      await supabase.auth.signOut();
    }

    // Clear cookies
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    return;
  },

  refreshToken: async ({ req, res }: { req: Request; res: Response }) => {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedError({
        code: ErrorCodeAuth.NO_REFRESH_TOKEN,
      });
    }

    try {
      // Use Supabase to refresh the session
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        // Clear invalid cookies
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");

        throw new UnauthorizedError({
          code: ErrorCodeAuth.INVALID_REFRESH_TOKEN,
          error,
        });
      }

      // Set new tokens in cookies
      setAuthTokens({
        res,
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token,
      });

      return;
    } catch (error) {
      console.error("Refresh token error:", error);

      // Clear cookies on unexpected error
      res.clearCookie("access_token");
      res.clearCookie("refresh_token");

      throw new InternalServerError({
        code: ErrorCode.SERVER_ERROR,
      });
    }
  },

  signUpNative: async ({ dto }: { dto: AuthSignUpUserReq }): Promise<AuthNativeSignUpUserRes> => {
    const { data, error } = await supabase.auth.signUp({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      if (error.status === 429) {
        throw new TooManyRequestsError({
          code: ErrorCodeAuth.RATE_LIMIT_EXCEEDED,
          error,
        });
      }

      throw new BadRequestError({
        code: error.code || ErrorCodeAuth.BAD_REQUEST,
        error: error,
      });
    }

    const existingNativeUser = await authRepository.getUserByAuthUserId(data.user!.id);

    if (existingNativeUser) {
      throw new ConflictError({
        code: ErrorCodeAuth.USER_EXISTS,
      });
    }

    const nativeUsername = `${dto.email.split("@")[0]}_${Math.random().toString(36).slice(2, 8)}`;

    const userDb = await authRepository.createUser({
      authUserId: data.user!.id,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      username: nativeUsername,
      role: "user",
    });

    if (!userDb) throw new InternalServerError({ code: ErrorCode.SERVER_ERROR });

    const user: AuthSignUpUserRes = {
      id: userDb.id,
      email: userDb.email,
      firstName: userDb.firstName,
      lastName: userDb.lastName,
      username: userDb.username,
      avatarUrl: userDb.avatarUrl,
      bio: userDb.bio,
      role: userDb.role,
    };

    return {
      user,
      accessToken: data.session?.access_token ?? "",
      refreshToken: data.session?.refresh_token ?? "",
    };
  },

  logInNative: async ({ dto }: { dto: AuthLogInUserReq }): Promise<AuthNativeLogInUserRes> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      throw new BadRequestError({
        code: ErrorCodeAuth.INVALID_CREDENTIALS,
        error,
      });
    }

    const userDb = await authRepository.getUserByAuthUserId(data.user.id);

    if (!userDb) {
      throw new NotFoundError({
        code: ErrorCodeAuth.USER_NOT_FOUND,
      });
    }

    const user: AuthLogInUserRes = {
      id: userDb.id,
      email: userDb.email,
      firstName: userDb.firstName,
      lastName: userDb.lastName,
      username: userDb.username,
      avatarUrl: userDb.avatarUrl,
      bio: userDb.bio,
      role: userDb.role,
    };

    return {
      user,
      accessToken: data.session?.access_token ?? "",
      refreshToken: data.session?.refresh_token ?? "",
    };
  },

  signOutNative: async ({ req }: { req: Request }) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      await supabase.auth.signOut();
    }
    return;
  },

  refreshTokenNative: async ({
    dto,
  }: {
    dto: AuthNativeRefreshTokenReq;
  }): Promise<AuthNativeRefreshTokenRes> => {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: dto.refreshToken,
    });

    if (error) {
      throw new UnauthorizedError({
        code: ErrorCodeAuth.INVALID_REFRESH_TOKEN,
        error,
      });
    }

    return {
      accessToken: data.session?.access_token ?? "",
      refreshToken: data.session?.refresh_token ?? "",
    };
  },
};
