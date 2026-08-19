import { en, hr } from "zod/locales";
import type { i18n } from "i18next";

export function getZodLocale(i18n?: i18n) {
  switch (i18n?.language) {
    case "sr":
      return hr();

    default:
      return en();
  }
}
