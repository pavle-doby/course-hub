import z from 'zod';

export const AuthSchemaSignUp = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  password: z.string().min(6),
});

export const AuthSchemaLogin = z.object({
  email: z.email(),
  password: z.string().min(6),
});
