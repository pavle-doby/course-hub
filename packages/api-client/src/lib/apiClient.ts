import Axios, { type AxiosRequestConfig } from 'axios';
import { env } from '../env';

export const apiClient = Axios.create({
  baseURL: env.API_URL ?? 'http://localhost:7007/api',
  withCredentials: true,
});

apiClient.interceptors.response.use(null, async (error) => {
  if (error.response?.status === 401 && !error.config._retry) {
    error.config._retry = true;
    await apiClient.post('/auth/refresh'); // sets new cookies
    return apiClient(error.config);
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
