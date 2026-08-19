import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { AuthProvider } from './providers/AuthProvider';
import { KeyboardSafeViewProvider } from './providers/KeyboardSafeViewProvider';
import { ApiClientProvider } from '@repo/api-client';
import { StackProvider } from './providers/StackProvider';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <ApiClientProvider>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        <AuthProvider>
          <KeyboardSafeViewProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <StackProvider />
            <PortalHost />
          </KeyboardSafeViewProvider>
        </AuthProvider>
      </ThemeProvider>
    </ApiClientProvider>
  );
}
