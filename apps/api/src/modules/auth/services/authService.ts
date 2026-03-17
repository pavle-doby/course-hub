import { Request, Response } from "express";
import {
  ErrorCodeAuth,
  ErrorCode,
  LogInUserReq,
  LogInUserRes,
  SignUpUserReq,
  SignUpUserRes,
} from "@my/contract";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
} from "api/types/errors";
import { supabase } from "api/utils/supabase";
import { authRepository } from "../repository/authRepository";
import { CreateUser } from "../repository/types";
import { setAuthTokens } from "../utils/setAuthTokens";

export const authService = {
  signUp: async ({
    dto,
    res,
  }: {
    dto: SignUpUserReq;
    res: Response;
  }): Promise<SignUpUserRes> => {
    const { data, error } = await supabase.auth.signUp({
      email: dto.email,
      password: dto.password,
    });

    // Handle Supabase auth errors
    if (error) {
      throw new BadRequestError({
        code: error.code || ErrorCodeAuth.BAD_REQUEST,
        error: error,
      });
    }

    const user: CreateUser = {
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: "user",
      status: "pending",
    };

    const existingUser = await authRepository.getUserByEmail(dto.email);

    if (existingUser) {
      throw new ConflictError({
        code: ErrorCodeAuth.USER_EXISTS,
      });
    }

    const userDb = await authRepository.createUser(user);

    const userDto: SignUpUserRes = {
      id: userDb.id,
      email: userDb.email,
      image: userDb.image,
      firstName: userDb.firstName,
      lastName: userDb.lastName,
      role: userDb.role,
      status: userDb.status,
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
    dto: LogInUserReq;
    res: Response;
  }): Promise<LogInUserRes> => {
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

    const user = await authRepository.getUserByEmail(dto.email);

    if (!user) {
      throw new NotFoundError({
        code: ErrorCodeAuth.USER_NOT_FOUND,
      });
    }

    const userDto: LogInUserRes = {
      id: user.id,
      email: user.email,
      image: user.image,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
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
};
