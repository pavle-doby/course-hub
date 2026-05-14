import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { ApiClientProvider, configureTokenProviders } from '@my/api-client';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './providers/AuthProvider';
import { getAccessToken, getRefreshToken, saveTokens } from 'app/utils/tokenStorage';
import { StackProvider } from './providers/StackProvider';

// Configure the API client to use secure-store tokens for native auth.
// This runs once at module evaluation time, before any requests are made.
configureTokenProviders({
  getToken: getAccessToken,
  onRefresh: async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;
    // Inline fetch to avoid going through the interceptor loop
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:7007/api'}/v1/auth/refresh/native`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }
    );
    if (!res.ok) return null;
    const tokens = (await res.json()) as { accessToken: string; refreshToken: string };
    await saveTokens(tokens.accessToken, tokens.refreshToken);
    return tokens;
  },
});

export const unstable_settings = {
  // Ensure that reloading on `/user` keeps a back button present.
  initialRouteName: 'Home',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [interLoaded, interError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  useEffect(() => {
    if (interLoaded || interError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync();
    }
  }, [interLoaded, interError]);

  if (!interLoaded && !interError) {
    return null;
  }

  return (
    <ApiClientProvider>
      <ThemeProvider>
        <AuthProvider>
          <StackProvider />
        </AuthProvider>
      </ThemeProvider>
    </ApiClientProvider>
  );
}
