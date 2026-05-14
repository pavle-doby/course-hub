import { z } from 'zod';
import { User } from '../users';
import {
  AuthLoginQuerySchema,
  AuthNativeRefreshQuerySchema,
  AuthSignUpQuerySchema,
} from './schemas';

export type AuthSignUpUserReq = z.infer<typeof AuthSignUpQuerySchema>;
export type AuthSignUpUserRes = User;

export type AuthLogInUserReq = z.infer<typeof AuthLoginQuerySchema>;
export type AuthLogInUserRes = User;

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthNativeSignUpUserRes = { user: User } & AuthTokens;
export type AuthNativeLogInUserRes = { user: User } & AuthTokens;
export type AuthNativeRefreshTokenReq = z.infer<typeof AuthNativeRefreshQuerySchema>;
export type AuthNativeRefreshTokenRes = AuthTokens;
