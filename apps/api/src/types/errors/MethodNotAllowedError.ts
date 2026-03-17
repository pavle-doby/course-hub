import { ErrorCode } from '@my/contract';
import { ApiError, ApiErrorProps } from './ApiError';

/**
 * Method Not Allowed Error - HTTP Status `405`
 */
export class MethodNotAllowedError extends ApiError {
  constructor(error: ApiErrorProps = {}) {
    super({
      ...error,
      status: 405,
      code: error.code || ErrorCode.NOT_FOUND_ENDPOINT,
    });
  }
}
