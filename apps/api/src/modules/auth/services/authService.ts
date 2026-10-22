import type { Request } from "express";
import {
  ErrorCodeAuth,
  ErrorCode,
  AuthLogInUserReq,
  AuthLogInUserRes,
  AuthSignUpUserReq,
  AuthSignUpUserRes,
  AuthRefreshTokenReq,
  AuthRefreshTokenRes,
  AuthForgotPasswordReq,
  AuthResetPasswordReq,
  User,
} from "@repo/contract";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
  TooManyRequestsError,
} from "@repo/contract";
import { createClient } from "@supabase/supabase-js";
import { env } from "api/env";
import { supabase } from "api/utils/supabase";
import { authRepository } from "../repository/authRepository";
import { CreateUser } from "../repository/types";

export const authService = {
  signUp: async ({ dto }: { dto: AuthSignUpUserReq }): Promise<AuthSignUpUserRes> => {
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

    const userDb = await authRepository.createUser(user, {
      language: dto.language,
      theme: dto.theme,
    });

    if (!userDb) throw new InternalServerError({ code: ErrorCode.SERVER_ERROR });

    const userDto: User = {
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
      user: userDto,
      preferences: { language: dto.language, theme: dto.theme },
      accessToken: data.session?.access_token ?? "",
      refreshToken: data.session?.refresh_token ?? "",
    };
  },

  logIn: async ({ dto }: { dto: AuthLogInUserReq }): Promise<AuthLogInUserRes> => {
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

    const user = await authRepository.getUserByAuthUserId(data.user.id);

    if (!user) {
      throw new NotFoundError({
        code: ErrorCodeAuth.USER_NOT_FOUND,
      });
    }

    const preferences = await authRepository.getUserPreferences(user.id);

    if (!preferences) {
      throw new InternalServerError({ code: ErrorCode.SERVER_ERROR });
    }

    const userDto: User = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      role: user.role,
    };

    return {
      user: userDto,
      preferences,
      accessToken: data.session?.access_token ?? "",
      refreshToken: data.session?.refresh_token ?? "",
    };
  },

  signOut: async ({ req }: { req: Request }) => {
    const token = req.headers.authorization;

    if (token) {
      // Sign out from Supabase
      await supabase.auth.signOut();
    }

    return;
  },

  refreshToken: async ({ dto }: { dto: AuthRefreshTokenReq }): Promise<AuthRefreshTokenRes> => {
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

  forgotPassword: async ({ dto }: { dto: AuthForgotPasswordReq }): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(dto.email, {
      redirectTo: `${env.WEB_APP_URL}/auth/reset`,
    });

    // Other errors are swallowed so the response never reveals whether the email exists
    if (error?.status === 429) {
      throw new TooManyRequestsError({
        code: ErrorCodeAuth.RATE_LIMIT_EXCEEDED,
        error,
      });
    }
  },

  resetPassword: async ({ dto }: { dto: AuthResetPasswordReq }): Promise<void> => {
    // verifyOtp stores a session on the client, so never use the shared singleton here
    const client = createClient(env.SUPABASE_URL, env.SUPABASE_API_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: verifyError } = await client.auth.verifyOtp({
      type: "recovery",
      token_hash: dto.tokenHash,
    });

    if (verifyError) {
      if (verifyError.status === 429) {
        throw new TooManyRequestsError({
          code: ErrorCodeAuth.RATE_LIMIT_EXCEEDED,
          error: verifyError,
        });
      }

      throw new BadRequestError({
        code: ErrorCodeAuth.RESET_LINK_INVALID,
        error: verifyError,
      });
    }

    const { error: updateError } = await client.auth.updateUser({ password: dto.password });

    if (updateError) {
      if (updateError.code === "same_password") {
        throw new BadRequestError({
          code: ErrorCodeAuth.SAME_PASSWORD,
          error: updateError,
        });
      }

      throw new BadRequestError({
        code: updateError.code || ErrorCodeAuth.BAD_REQUEST,
        error: updateError,
      });
    }

    // Best effort: log out every other device that still holds the old session
    await client.auth.signOut({ scope: "others" });
  },
};
