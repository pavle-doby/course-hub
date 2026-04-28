import { useColorScheme } from 'react-native';
import { TamaguiProvider, type TamaguiProviderProps } from 'tamagui';
import { ToastProvider } from '@tamagui/toast';
import { config } from '@my/config';
import { ToastViewport } from './ToastViewport';
import { CustomToast } from '@my/ui';
import { ApiClientProvider } from '@my/api-client';

export function Provider({
  children,
  defaultTheme = 'light',
  ...rest
}: Omit<TamaguiProviderProps, 'config' | 'defaultTheme'> & { defaultTheme?: string }) {
  const colorScheme = useColorScheme();
  const theme = defaultTheme || (colorScheme === 'dark' ? 'dark' : 'light');

  return (
    <ApiClientProvider>
      <TamaguiProvider
        config={config}
        defaultTheme={theme}
        {...rest}
      >
        <ToastProvider>
          <CustomToast />
          {children}
          <ToastViewport />
        </ToastProvider>
      </TamaguiProvider>
    </ApiClientProvider>
  );
}
