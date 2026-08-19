import { z } from "zod";
import { en, hr } from "zod/locales";
import type { i18n } from "i18next";

export function setZodLocale(i18n: i18n) {
  switch (i18n.language) {
    case "sr":
      z.config(hr());
      break;

    default:
      z.config(en());
  }
}
