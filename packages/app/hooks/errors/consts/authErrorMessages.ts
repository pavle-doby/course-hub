import { ErrorCodeAuth } from '@my/contract';

export const authErrorMessages: Record<ErrorCodeAuth, { title: string; message: string }> = {
  [ErrorCodeAuth.INVALID_CREDENTIALS]: {
    title: 'Invalid Credentials',
    message: 'The email or password you entered is incorrect.',
  },
  [ErrorCodeAuth.UNAUTHORIZED]: {
    title: 'Unauthorized',
    message: 'You are not authorized to perform this action.',
  },
  [ErrorCodeAuth.USER_EXISTS]: {
    title: 'Account Already Exists',
    message: 'An account with this email address already exists.',
  },
  [ErrorCodeAuth.NO_REFRESH_TOKEN]: {
    title: 'Session Expired',
    message: 'Your session has expired. Please sign in again.',
  },
  [ErrorCodeAuth.INVALID_REFRESH_TOKEN]: {
    title: 'Invalid Session',
    message: 'Your session is invalid. Please sign in again.',
  },
  [ErrorCodeAuth.USER_NOT_FOUND]: {
    title: 'User Not Found',
    message: 'No account was found with the provided information.',
  },
  [ErrorCodeAuth.BAD_REQUEST]: {
    title: 'Bad Request',
    message: 'The request could not be processed. Please try again.',
  },
  [ErrorCodeAuth.RATE_LIMIT_EXCEEDED]: {
    title: 'Too Many Attempts',
    message: 'You have made too many attempts. Please try again later.',
  },
};
