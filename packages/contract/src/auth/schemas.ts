import { z } from 'zod';

export const AuthSignUpQuerySchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  password: z.string().min(6),
});

export const AuthLoginQuerySchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});
