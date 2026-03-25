/**
 * Base class for API errors
 * Defaults to HTTP Status `500`
 */
export class ApiError {
  readonly status: number = 500;
  readonly code: string;

  error?: Error | null | unknown;
  details?: Record<string, unknown>;

  constructor(error: ApiError) {
    this.status = error.status || 500;
    this.code = error.code || 'server_error';
    this.error = error.error;
    this.details = error.details;
  }
}

export type ApiErrorProps = Omit<ApiError, 'status' | 'code'> & { code?: string };
