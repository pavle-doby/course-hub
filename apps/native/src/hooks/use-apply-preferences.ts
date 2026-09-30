import { useCallback } from "react";
import { useColorScheme } from "nativewind";
import { useTranslation } from "@repo/i18n/native";

type Preferences = { language: string; theme: "light" | "dark" | "system" };

/** Applies language + theme live. `system` follows the device. */
export function useApplyPreferences() {
  const { i18n } = useTranslation();
  const { setColorScheme } = useColorScheme();

  return useCallback(
    ({ language, theme }: Preferences) => {
      setColorScheme(theme);
      if (i18n.language !== language) {
        void i18n.changeLanguage(language);
      }
    },
    [i18n, setColorScheme]
  );
}
