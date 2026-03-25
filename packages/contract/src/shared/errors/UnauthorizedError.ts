import { ErrorCode } from './ErrorCode';
import { ApiError, ApiErrorProps } from './ApiError';

/**
 * Unauthorized Error - HTTP Status `401`
 */
export class UnauthorizedError extends ApiError {
  constructor(error: ApiErrorProps = {}) {
    super({
      ...error,
      status: 401,
      code: error.code || ErrorCode.UNAUTHORIZED,
    });
  }
}
