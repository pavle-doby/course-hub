'use client';

import { useState } from 'react';
import { useIsomorphicLayoutEffect } from 'tamagui';
import { useThemeSetting, useRootTheme } from '@tamagui/next-theme';
import { UIButton } from '@my/ui';

export const SwitchThemeButton = () => {
  const themeSetting = useThemeSetting();
  const [theme] = useRootTheme();

  const [clientTheme, setClientTheme] = useState<string | undefined>('light');

  useIsomorphicLayoutEffect(() => {
    setClientTheme(themeSetting.forcedTheme || themeSetting.current || theme);
  }, [themeSetting.current, themeSetting.resolvedTheme]);

  return <UIButton onPress={themeSetting.toggle}>Change theme: {clientTheme}</UIButton>;
};
