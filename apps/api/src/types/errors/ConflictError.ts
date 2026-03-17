import { ErrorCode } from '@my/contract';
import { ApiError, ApiErrorProps } from './ApiError';

/**
 * Conflict Error - HTTP Status `409`
 */
export class ConflictError extends ApiError {
  constructor(error: ApiErrorProps = {}) {
    super({
      ...error,
      status: 409,
      code: error.code || ErrorCode.VALIDATION_ERROR,
    });
  }
}
