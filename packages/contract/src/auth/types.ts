import { z } from "zod";
import { User } from "../users";
import {
  AuthForgotPasswordQuerySchema,
  AuthLoginQuerySchema,
  AuthPreferencesSchema,
  AuthRefreshQuerySchema,
  AuthResetPasswordQuerySchema,
  AuthSignUpQuerySchema,
} from "./schemas";

export type AuthSignUpUserReq = z.infer<typeof AuthSignUpQuerySchema>;
export type AuthSignUpUserRes = { user: User; preferences: AuthPreferences } & AuthTokens;

export type AuthLogInUserReq = z.infer<typeof AuthLoginQuerySchema>;
export type AuthLogInUserRes = { user: User; preferences: AuthPreferences } & AuthTokens;

export type AuthPreferences = z.infer<typeof AuthPreferencesSchema>;

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthRefreshTokenReq = z.infer<typeof AuthRefreshQuerySchema>;
export type AuthRefreshTokenRes = AuthTokens;

export type AuthForgotPasswordReq = z.infer<typeof AuthForgotPasswordQuerySchema>;

export type AuthResetPasswordReq = z.infer<typeof AuthResetPasswordQuerySchema>;
