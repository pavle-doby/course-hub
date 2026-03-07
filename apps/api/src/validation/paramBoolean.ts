import z from 'zod';

export const paramBoolean = () => {
  return z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean());
};
