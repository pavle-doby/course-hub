import Axios, { type AxiosRequestConfig } from "axios";
import { env } from "../env";

export const apiClient = Axios.create({
  baseURL: env.API_URL,
});

// Token providers are configured by the app at startup.
let getTokenFn: (() => Promise<string | null>) | null = null;
let refreshFn: (() => Promise<{ accessToken: string; refreshToken: string } | null>) | null = null;
let unauthorizedFn: (() => void) | null = null;

/**
 * Configure how the API client retrieves and refreshes tokens.
 * Call this at app startup before any requests are made.
 */
export const configureTokenProviders = (opts: {
  getToken: () => Promise<string | null>;
  onRefresh: () => Promise<{
    accessToken: string;
    refreshToken: string;
  } | null>;
  onUnauthorized: () => void;
}) => {
  getTokenFn = opts.getToken;
  refreshFn = opts.onRefresh;
  unauthorizedFn = opts.onUnauthorized;
};

// Attach Authorization header when a token provider is configured.
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
  const isRefreshEndpoint = error.config?.url?.includes("/auth/refresh");
  if (error.response?.status === 401 && !error.config._retry && !isRefreshEndpoint) {
    error.config._retry = true;
    try {
      if (refreshFn) {
        const tokens = await refreshFn();
        if (!tokens) {
          unauthorizedFn?.();
          return Promise.reject(error);
        }
        error.config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      } else {
        unauthorizedFn?.();
        return Promise.reject(error);
      }
      return apiClient(error.config);
    } catch {
      unauthorizedFn?.();
      return Promise.reject(error);
    }
  }
  if (error.response?.status === 401 && !isRefreshEndpoint) {
    unauthorizedFn?.();
  }
  return Promise.reject(error);
});

/**
 * Custom Orval mutator — wraps every generated request with the configured
 * Axios instance so configured token providers are applied automatically.
 * Orval v8 passes AbortSignal via config.signal; Axios 1.x handles it natively.
 */
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  return apiClient({
    ...config,
    ...options,
  }).then(({ data }) => data);
};
