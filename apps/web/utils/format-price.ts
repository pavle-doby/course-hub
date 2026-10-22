import { COURSE_CURRENCY } from "./consts";

/** Formats a price in minor units (cents) of `COURSE_CURRENCY` for the given locale. */
export function formatPrice(cents: number, language: string) {
  return new Intl.NumberFormat(language, { style: "currency", currency: COURSE_CURRENCY }).format(
    cents / 100
  );
}
