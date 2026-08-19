import i18n from "i18next";
import { DEFAULT_LOCALE, FALLBACK_LOCALE } from "./constants";
import { baseConfig, resources } from "./config.base";

export const nativeConfig = {
  ...baseConfig,
  resources,
  lng: DEFAULT_LOCALE,
  fallbackLng: FALLBACK_LOCALE,
} as const;

export default i18n;
