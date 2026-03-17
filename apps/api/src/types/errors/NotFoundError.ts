import { ErrorCode } from '@my/contract';
import { ApiError, ApiErrorProps } from './ApiError';

/**
 * Not Found Error - HTTP Status `404`
 */
export class NotFoundError extends ApiError {
  constructor(error: ApiErrorProps = {}) {
    super({ ...error, status: 404, code: error.code || ErrorCode.NOT_FOUND });
  }
}
