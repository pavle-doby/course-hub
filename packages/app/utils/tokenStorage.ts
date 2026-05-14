// Web stub — token auth is handled via HTTP-only cookies on web.

export const saveTokens = async (_accessToken: string, _refreshToken: string): Promise<void> => {};

export const getAccessToken = async (): Promise<string | null> => null;

export const getRefreshToken = async (): Promise<string | null> => null;

export const clearTokens = async (): Promise<void> => {};
