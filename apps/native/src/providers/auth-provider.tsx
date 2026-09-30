import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";
import { configureTokenProviders, useQueryClient, type AuthTokens } from "@repo/api-client";
import { deviceLocale } from "@/utils/device-locale";
import { useApplyPreferences } from "@/hooks/use-apply-preferences";
import { refreshTokens } from "@/utils/refresh-tokens";
import {
  clearAuthTokens,
  getAccessToken,
  loadAuthTokens,
  saveAuthTokens,
} from "@/utils/token-storage";

type AuthStatus = "loading" | "signedIn" | "signedOut";

type AuthContextValue = {
  status: AuthStatus;
  signIn: (tokens: AuthTokens) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const queryClient = useQueryClient();
  const applyPreferences = useApplyPreferences();

  const signIn = useCallback(async (tokens: AuthTokens) => {
    await saveAuthTokens(tokens);
    setStatus("signedIn");
  }, []);

  const signOut = useCallback(async () => {
    await clearAuthTokens();
    queryClient.clear();
    applyPreferences({ language: deviceLocale, theme: "system" });
    setStatus("signedOut");
  }, [queryClient, applyPreferences]);

  // Signed-in screens (and their queries) only mount after the tokens load, which is after this runs.
  useEffect(() => {
    configureTokenProviders({
      getToken: async () => getAccessToken(),
      onRefresh: refreshTokens,
      onUnauthorized: () => void signOut(),
    });
  }, [signOut]);

  useEffect(() => {
    void loadAuthTokens().then((tokens) => setStatus(tokens ? "signedIn" : "signedOut"));
  }, []);

  const value = useMemo(() => ({ status, signIn, signOut }), [status, signIn, signOut]);

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const ctx = use(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
