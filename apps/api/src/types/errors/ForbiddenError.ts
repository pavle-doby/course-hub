import { ErrorCode } from '@my/contract';
import { ApiError, ApiErrorProps } from './ApiError';

/**
 * Forbidden Error - HTTP Status `403`
 */
export class ForbiddenError extends ApiError {
  constructor(error: ApiErrorProps = {}) {
    super({
      ...error,
      status: 403,
      code: error.code || ErrorCode.FORBIDDEN,
    });
  }
}
