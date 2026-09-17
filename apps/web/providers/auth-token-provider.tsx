"use client";

import { apiClient, configureTokenProviders } from "@repo/api-client";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
} from "@/utils/token-storage";

configureTokenProviders({
  getToken: async () => getAccessToken(),
  onRefresh: async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      redirectToLogin();
      return null;
    }

    try {
      const { data } = await apiClient.post<{ accessToken: string; refreshToken: string }>(
        "/v1/auth/refresh",
        { refreshToken }
      );
      saveAuthTokens(data.accessToken, data.refreshToken);
      return data;
    } catch {
      redirectToLogin();
      return null;
    }
  },
});

function redirectToLogin(): void {
  clearAuthTokens();

  if (!window.location.pathname.startsWith("/auth")) {
    window.location.assign("/auth/login");
  }
}

export function AuthTokenProvider({ children }: React.PropsWithChildren) {
  return children;
}
