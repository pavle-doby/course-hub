export enum ErrorCodeAuth {
  INVALID_CREDENTIALS = 'auth_invalid_credentials',
  UNAUTHORIZED = 'auth_unauthorized',
  USER_EXISTS = 'auth_user_exists',
  NO_REFRESH_TOKEN = 'auth_no_refresh_token',
  INVALID_REFRESH_TOKEN = 'auth_invalid_refresh_token',
  USER_NOT_FOUND = 'auth_user_not_found',
  BAD_REQUEST = 'auth_bad_request',
  RATE_LIMIT_EXCEEDED = 'auth_rate_limit_exceeded',
}
