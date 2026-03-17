import { ErrorCode, PaginationReq } from '@my/contract';
import { BadRequestError } from 'api/types/errors';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const BASE = 0; // 0-based indexing
const LIMIT_MIN = 1;
const LIMIT_MAX = 100;

/**
 * This type is used internally in the API to handle pagination
 */
export type PaginationReqExtended = PaginationReq & {
  page: number;
  offset?: number;
};

export const PaginationParams = z.object({
  page: z.coerce.number().min(BASE).default(BASE),
  limit: z.coerce.number().min(LIMIT_MIN).max(LIMIT_MAX).optional(),
});

/**
 * Validates and parses pagination query parameters.
 *
 * Sets `res.locals.pagination` with `{ page, limit, offset }`.
 *
 */
export const pagination = (defaults = { page: BASE }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsedQuery = PaginationParams.safeParse(req.query);

    if (!parsedQuery.success) {
      const error = new BadRequestError({
        code: ErrorCode.INVALID_PAGINATION_PARAMS,
        error: parsedQuery.error,
      });
      res.status(error.status).json(error);
      return;
    }

    const query = parsedQuery.data;

    const page = Math.max(query.page || defaults.page, BASE);
    const limit = query.limit;
    const offset = limit ? (page - BASE) * limit : undefined;

    const pagination: PaginationReqExtended = { page, limit, offset };

    res.locals.pagination = pagination;

    next();
  };
};
