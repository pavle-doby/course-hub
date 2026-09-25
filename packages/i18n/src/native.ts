import i18n, { nativeConfig } from "./config.native";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import { LOCALES, DEFAULT_LOCALE } from "./constants";
import type { Locale } from "./types";

export * from "react-i18next";
export { LOCALES as locales, DEFAULT_LOCALE as defaultLocale } from "./constants";

const deviceLanguage = getLocales()[0]?.languageCode;
const lng = LOCALES.includes(deviceLanguage as Locale)
  ? (deviceLanguage as Locale)
  : DEFAULT_LOCALE;

i18n.use(initReactI18next).init({ ...nativeConfig, lng });

export default i18n;
