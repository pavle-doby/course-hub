import Axios, { type AxiosRequestConfig } from 'axios';
import { env } from '../env';

export const apiClient = Axios.create({
  baseURL: env.API_URL ?? 'http://localhost:7007/api',
  withCredentials: true,
});

// Optional token providers — set by platform-specific code (e.g. native)
let getTokenFn: (() => Promise<string | null>) | null = null;
let refreshFn: (() => Promise<{ accessToken: string; refreshToken: string } | null>) | null = null;

/**
 * Configure how the API client retrieves and refreshes tokens.
 * Call this at app startup on native before any requests are made.
 */
export const configureTokenProviders = (opts: {
  getToken: () => Promise<string | null>;
  onRefresh: () => Promise<{ accessToken: string; refreshToken: string } | null>;
}) => {
  getTokenFn = opts.getToken;
  refreshFn = opts.onRefresh;
};

// Attach Authorization header when a token provider is configured (native)
apiClient.interceptors.request.use(async (config) => {
  if (getTokenFn) {
    const token = await getTokenFn();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(null, async (error) => {
  const isRefreshEndpoint = error.config?.url?.includes('/auth/refresh');
  if (error.response?.status === 401 && !error.config._retry && !isRefreshEndpoint) {
    error.config._retry = true;
    try {
      if (refreshFn) {
        // Native: refresh via body, save new tokens, retry with new Authorization header
        const tokens = await refreshFn();
        if (tokens) {
          error.config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
      } else {
        // Web: refresh via cookie
        await apiClient.post('/v1/auth/refresh');
      }
      return apiClient(error.config);
    } catch {
      return Promise.reject(error);
    }
  }
  return Promise.reject(error);
});

/**
 * Custom Orval mutator — wraps every generated request with the configured
 * Axios instance so credentials (cookies) are sent automatically.
 */
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = apiClient({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error — attach cancel to the promise so Orval can abort
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};
