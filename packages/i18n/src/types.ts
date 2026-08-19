import "i18next";
import en from "./locales/en";
import { LOCALES, DEFAULT_NS } from "./constants";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof DEFAULT_NS;
    resources: { [K in typeof DEFAULT_NS]: typeof en };
  }
}

export type TranslationResources = typeof en;

export type Locale = (typeof LOCALES)[number];
