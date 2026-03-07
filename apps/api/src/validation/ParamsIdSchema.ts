import z from 'zod';

export const ParamsIdSchema = z.object({
  id: z.uuid(),
});
