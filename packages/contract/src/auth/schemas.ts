import { z } from 'zod';

export const AuthSignUpQuerySchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.email(),
  password: z.string().min(6),
});

export const AuthLoginQuerySchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});
