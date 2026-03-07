import type { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '@repo/contract';
import {
  NotFoundError,
  InternalServerError,
  UnprocessableEntityError,
  ApiError,
} from 'api/types/errors';
import { logger } from 'api/logger';
import postgres from 'postgres';

/**
 * Middleware to handle not found endpoints
 */
export const handleErrorNotFound = (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const error = new NotFoundError({
    code: ErrorCode.NOT_FOUND_ENDPOINT,
  });

  logger.warn({ error }, 'Endpoint not found');

  res.status(error.status).json(error);
};

/**
 * Error handling middleware
 *
 * @param next - If removed as param `errorMiddleware` will not be called
 */
export function handleError(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const error = err as ApiError | Error;

  if (error instanceof ApiError) {
    logger.warn({ error }, 'Handled error');
    res.status(error.status).json(error);
    return;
  }

  if (error.cause instanceof postgres.PostgresError) {
    const dbError = new UnprocessableEntityError({ error });
    logger.error({ dbError }, 'Unhandled database error');
    res.status(dbError.status).json(dbError);

    return;
  }

  const serverError = new InternalServerError({
    code: ErrorCode.SERVER_ERROR,
    error: error,
  });

  logger.error({ error, serverError }, 'Unhandled server error');

  res.status(serverError.status).json(serverError);
}
