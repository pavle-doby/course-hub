import * as SecureStore from "expo-secure-store";
import type { AuthTokens } from "@repo/api-client";

const ACCESS_TOKEN_KEY = "ch_access_token";
const REFRESH_TOKEN_KEY = "ch_refresh_token";

// In-memory copy so the API interceptor doesn't hit the keychain on every request.
let cache: AuthTokens | null = null;

export async function loadAuthTokens(): Promise<AuthTokens | null> {
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  ]);
  cache = accessToken && refreshToken ? { accessToken, refreshToken } : null;
  return cache;
}

export async function saveAuthTokens(tokens: AuthTokens): Promise<void> {
  cache = tokens;
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
  ]);
}

export function getAccessToken(): string | null {
  return cache?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return cache?.refreshToken ?? null;
}

export async function clearAuthTokens(): Promise<void> {
  cache = null;
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}
