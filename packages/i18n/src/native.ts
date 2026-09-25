import i18n, { nativeConfig } from "./config.native";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-react-native-language-detector";

export * from "react-i18next";
export { LOCALES as locales, DEFAULT_LOCALE as defaultLocale } from "./constants";

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    ...nativeConfig,
    compatibilityJSON: "v4",
  });

export default i18n;
