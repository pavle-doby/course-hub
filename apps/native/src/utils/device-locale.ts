import { getLocales } from "expo-localization";
import { defaultLocale, locales, type Locale } from "@repo/i18n/native";

const deviceLanguage = getLocales()[0]?.languageCode;

export const deviceLocale: Locale = locales.includes(deviceLanguage as Locale)
  ? (deviceLanguage as Locale)
  : defaultLocale;
