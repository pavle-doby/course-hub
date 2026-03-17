import type { ZodType } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '@my/contract';
import { BadRequestError } from 'api/types/errors/BadRequestError';

type SourceType = 'body' | 'query' | 'params';

/**
 * Validate request data using a Zod schema.
 *
 * All validated & parsed data is stored in `res.locals` under the same key as the source.
 * ```
 * res.locals.body
 * res.locals.query
 * res.locals.params
 * ```
 */
export function validate(schema: ZodType, source: SourceType = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const error = new BadRequestError({
        code: ErrorCode.VALIDATION_ERROR,
        error: result.error,
      });
      res.status(error.status).json(error);
      return;
    }

    res.locals[source] = {
      ...res.locals[source],
      ...(result.data as Record<string, unknown>),
    };

    next();
  };
}
