import { authRefreshToken, type AuthTokens } from "@repo/api-client";
import { getRefreshToken, saveAuthTokens } from "./token-storage";

let pending: Promise<AuthTokens | null> | null = null;

// Several queries can 401 at once (e.g. on app start); share one refresh so a rotated
// refresh token isn't used twice.
export function refreshTokens(): Promise<AuthTokens | null> {
  pending ??= doRefresh().finally(() => {
    pending = null;
  });
  return pending;
}

async function doRefresh(): Promise<AuthTokens | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }
  try {
    const tokens = await authRefreshToken({ refreshToken });
    await saveAuthTokens(tokens);
    return tokens;
  } catch {
    return null;
  }
}
