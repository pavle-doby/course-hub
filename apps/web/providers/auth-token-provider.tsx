"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
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
      return null;
    }
  },
  onUnauthorized: redirectToLogin,
});

function isPublicRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/invite/") ||
    (/^\/learn\/[^/]+$/.test(pathname) &&
      pathname !== "/learn/explore" &&
      pathname !== "/learn/enrolled")
  );
}

function redirectToLogin(): void {
  clearAuthTokens();

  const { pathname, search } = window.location;
  if (!isPublicRoute(pathname)) {
    // `next` brings the user back afterwards (e.g. to the OAuth consent page)
    window.location.assign(`/auth/login?next=${encodeURIComponent(pathname + search)}`);
  }
}

export function AuthTokenProvider({ children }: React.PropsWithChildren) {
  const pathname = usePathname();
  const publicRoute = isPublicRoute(pathname);

  useEffect(() => {
    if (!publicRoute && !getAccessToken()) {
      redirectToLogin();
    }
  }, [publicRoute]);

  return children;
}
