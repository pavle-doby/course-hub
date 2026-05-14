import { useEffect, useState, type ReactNode } from "react";
import { Appearance, useColorScheme } from "react-native";
import {
  Theme as NavTheme,
  ThemeProvider as NavThemeProvider,
} from "@react-navigation/native";
import { Provider } from "app/provider";
import { Theme, ThemeName } from "@my/ui";
import { DARK_THEME, LIGHT_THEME } from "@my/config/src/theme/index";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const colorScheme = useColorScheme();
  const [themeName, setThemeName] = useState<string>(colorScheme || "light");

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setThemeName(colorScheme || "light");
    });
    return () => listener.remove();
  }, []);

  const theme = themeName === "dark" ? DARK_THEME : LIGHT_THEME;

  const navTheme: NavTheme = {
    dark: themeName === "dark",
    colors: {
      primary: theme.primary,
      background: theme.background,
      card: theme.background,
      text: theme.color,
      border: theme.borderColor,
      notification: theme.info,
    },
    fonts: {} as any,
  };

  return (
    <Provider>
      <Theme name={themeName as ThemeName}>
        <NavThemeProvider value={navTheme}>{children}</NavThemeProvider>
      </Theme>
    </Provider>
  );
}
