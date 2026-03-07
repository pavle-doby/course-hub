import { ErrorCode } from '@repo/contract';
import { ApiError, ApiErrorProps } from './ApiError';

/**
 * Internal Server Error - HTTP Status `500`
 */
export class InternalServerError extends ApiError {
  constructor(error: ApiErrorProps = {}) {
    super({
      ...error,
      status: 500,
      code: error.code || ErrorCode.SERVER_ERROR,
    });
  }
}
