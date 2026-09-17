import { z } from "zod";
import { User } from "../users";
import {
  AuthLoginQuerySchema,
  AuthNativeRefreshQuerySchema,
  AuthSignUpQuerySchema,
} from "./schemas";

export type AuthSignUpUserReq = z.infer<typeof AuthSignUpQuerySchema>;
export type AuthSignUpUserRes = { user: User } & AuthTokens;

export type AuthLogInUserReq = z.infer<typeof AuthLoginQuerySchema>;
export type AuthLogInUserRes = { user: User } & AuthTokens;

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthNativeSignUpUserRes = AuthSignUpUserRes;
export type AuthNativeLogInUserRes = AuthLogInUserRes;
export type AuthNativeRefreshTokenReq = z.infer<typeof AuthNativeRefreshQuerySchema>;
export type AuthNativeRefreshTokenRes = AuthTokens;
