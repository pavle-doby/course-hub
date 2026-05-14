import { ErrorCodeUser } from '@my/contract';

export const userErrorMessages: Record<ErrorCodeUser, { title: string; message: string }> = {
  [ErrorCodeUser.NOT_FOUND]: {
    title: 'User Not Found',
    message: 'The requested user could not be found.',
  },
  [ErrorCodeUser.ALREADY_EXISTS]: {
    title: 'User Already Exists',
    message: 'An account with this information already exists.',
  },
};
