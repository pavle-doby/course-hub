import en from "./locales/en";
import sr from "./locales/sr";
import { DEFAULT_NS } from "./constants";

export const resources = {
  en: { common: en },
  sr: { common: sr },
} as const;

export const baseConfig = {
  defaultNS: DEFAULT_NS,
  interpolation: { escapeValue: false },
} as const;
