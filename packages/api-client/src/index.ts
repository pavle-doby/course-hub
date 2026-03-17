// Re-export the Axios client instance for consumers who need it directly
export { apiClient } from './lib/apiClient';
export { ApiClientProvider } from './api-client-provider';

// Generated types and hooks (run `pnpm generate:api` to populate these)
export * from './generated/courseHubAPI.schemas';
export * from './generated/auth/auth';
export * from './generated/users/users';
