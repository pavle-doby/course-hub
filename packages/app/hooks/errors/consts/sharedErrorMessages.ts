import { ErrorCode } from '@my/contract';

export const sharedErrorMessages: Record<ErrorCode, { title: string; message: string }> = {
  [ErrorCode.FORBIDDEN]: {
    title: 'Access Denied',
    message: 'You do not have permission to perform this action.',
  },
  [ErrorCode.UNAUTHORIZED]: {
    title: 'Unauthorized',
    message: 'You must be signed in to perform this action.',
  },
  [ErrorCode.NOT_FOUND]: {
    title: 'Not Found',
    message: 'The requested resource could not be found.',
  },
  [ErrorCode.SERVER_ERROR]: {
    title: 'Server Error',
    message: 'An unexpected error occurred. Please try again later.',
  },
  [ErrorCode.NOT_FOUND_ENDPOINT]: {
    title: 'Not Found',
    message: 'The requested endpoint does not exist.',
  },
  [ErrorCode.NO_TOKEN]: {
    title: 'Session Required',
    message: 'Please sign in to continue.',
  },
  [ErrorCode.INVALID_TOKEN]: {
    title: 'Invalid Session',
    message: 'Your session is invalid or has expired. Please sign in again.',
  },
  [ErrorCode.AUTH_CHECK_FAILED]: {
    title: 'Authentication Failed',
    message: 'We could not verify your identity. Please sign in again.',
  },
  [ErrorCode.VALIDATION_ERROR]: {
    title: 'Validation Error',
    message: 'Some fields are invalid. Please check your input and try again.',
  },
  [ErrorCode.INVALID_PAGINATION_PARAMS]: {
    title: 'Invalid Request',
    message: 'The pagination parameters provided are invalid.',
  },
};
