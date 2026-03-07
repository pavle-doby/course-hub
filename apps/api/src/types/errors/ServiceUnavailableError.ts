import { ErrorCode } from '@repo/contract';
import { ApiError, ApiErrorProps } from './ApiError';

/**
 * Service Unavailable Error - HTTP Status `503`
 */
export class ServiceUnavailableError extends ApiError {
  constructor(error: ApiErrorProps = {}) {
    super({
      ...error,
      status: 503,
      code: error.code || ErrorCode.SERVER_ERROR,
    });
  }
}
