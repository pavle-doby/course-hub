import { useEffect } from "react";
import type { i18n } from "i18next";
import { setZodLocale } from "@repo/shared/utils";

/**
 * Sets proper Zod locale based on the current i18n language.
 */
export function useZodLocale(i18n: i18n) {
  useEffect(() => {
    setZodLocale(i18n);
  }, [i18n.language]);
}
