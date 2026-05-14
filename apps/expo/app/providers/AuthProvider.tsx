import { clearTokens, getAccessToken } from 'app/utils/tokenStorage';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface AuthContextValue {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  login: () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check once on mount — subsequent state changes are driven imperatively
  useEffect(() => {
    getAccessToken().then((token) => {
      setIsLoggedIn(!!token);
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(() => setIsLoggedIn(true), []);

  const logout = useCallback(async () => {
    await clearTokens();
    setIsLoggedIn(false);
  }, []);

  if (isLoading) return null;

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
