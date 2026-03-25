export { ApiError, type ApiErrorProps } from './ApiError';

// 4xx Client Errors
export { BadRequestError } from './BadRequestError';
export { UnauthorizedError } from './UnauthorizedError';
export { ForbiddenError } from './ForbiddenError';
export { NotFoundError } from './NotFoundError';
export { MethodNotAllowedError } from './MethodNotAllowedError';
export { ConflictError } from './ConflictError';
export { UnprocessableEntityError } from './UnprocessableEntityError';
export { TooManyRequestsError } from './TooManyRequestsError';

// 5xx Server Errors
export { InternalServerError } from './InternalServerError';
export { ServiceUnavailableError } from './ServiceUnavailableError';

export { ErrorCode } from './ErrorCode';
export { ApiErrorSchema, type ApiErrorResponse } from './ApiErrorSchema';
