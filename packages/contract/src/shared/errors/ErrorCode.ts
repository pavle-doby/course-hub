// TODO@pavle: In web create a map that shows proper messages for each error code, and use it in the error handling hook.

/**
 * Global error codes used across the application.
 */
export enum ErrorCode {
  FORBIDDEN = 'forbidden',
  UNAUTHORIZED = 'unauthorized',
  NOT_FOUND = 'not_found',
  SERVER_ERROR = 'server_error',
  NOT_FOUND_ENDPOINT = 'not_found_endpoint',
  NO_TOKEN = 'no_token',
  INVALID_TOKEN = 'invalid_token',
  AUTH_CHECK_FAILED = 'auth_check_failed',
  VALIDATION_ERROR = 'validation_error',
  INVALID_PAGINATION_PARAMS = 'invalid_pagination_params',
}
