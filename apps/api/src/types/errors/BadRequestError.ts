import { ErrorCode } from '@my/contract';
import { ApiError, ApiErrorProps } from './ApiError';

/**
 * Bad Request Error - HTTP Status `400`
 */
export class BadRequestError extends ApiError {
  constructor(error: ApiErrorProps = {}) {
    super({
      ...error,
      status: 400,
      code: error.code || ErrorCode.VALIDATION_ERROR,
    });
  }
}
