import { ApiError, ApiErrorProps } from './ApiError';

/**
 * Too Many Requests Error - HTTP Status `429`
 */
export class TooManyRequestsError extends ApiError {
  constructor(error: ApiErrorProps = {}) {
    super({
      ...error,
      status: 429,
      code: error.code || 'too_many_requests',
    });
  }
}
