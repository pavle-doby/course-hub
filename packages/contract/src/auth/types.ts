import { z } from 'zod';
import { User } from '../users';
import { AuthLoginQuerySchema, AuthSignUpQuerySchema } from './schemas';

export type AuthSignUpUserReq = z.infer<typeof AuthSignUpQuerySchema>;
export type AuthSignUpUserRes = User;

export type AuthLogInUserReq = z.infer<typeof AuthLoginQuerySchema>;
export type AuthLogInUserRes = User;
