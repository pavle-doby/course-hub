import i18n, { nativeConfig } from "./config.native";
import { initReactI18next } from "react-i18next";

export * from "react-i18next";
export type { TFunction } from "i18next";
export { LOCALES as locales, DEFAULT_LOCALE as defaultLocale } from "./constants";
export type { Locale } from "./types";

// The app detects the device language (expo-localization) and calls i18n.changeLanguage,
// which keeps Expo out of this package's dependencies.
void i18n.use(initReactI18next).init(nativeConfig);

export default i18n;
