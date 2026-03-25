import { z } from 'zod';
import { ErrorCode } from './ErrorCode';

export const ApiErrorSchema = z.object({
  status: z.number().int(),
  code: z.enum(ErrorCode),
  error: z.unknown().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorSchema>;
