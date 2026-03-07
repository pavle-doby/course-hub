import { ErrorCode } from '@repo/contract';
import { ApiError, ApiErrorProps } from './ApiError';

/**
 * Unprocessable Entity Error - HTTP Status `422`
 */
export class UnprocessableEntityError extends ApiError {
  constructor(error: ApiErrorProps = {}) {
    super({
      ...error,
      status: 422,
      code: error.code || ErrorCode.VALIDATION_ERROR,
    });
  }
}
