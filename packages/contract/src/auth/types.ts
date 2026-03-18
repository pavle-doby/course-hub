import { z } from 'zod';
import { User } from '../users';
import { AuthLoginQuerySchema, AuthSignUpQuerySchema } from './schemas';

export type SignUpUserReq = z.infer<typeof AuthSignUpQuerySchema>;
export type SignUpUserRes = User;

export type LogInUserReq = z.infer<typeof AuthLoginQuerySchema>;
export type LogInUserRes = User;
