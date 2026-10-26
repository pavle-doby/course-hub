import { COURSE_CURRENCY } from "./consts";

/** Formats a price in minor units (cents) of `COURSE_CURRENCY` for the given locale. */
export function formatPrice(cents: number, language: string, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(language, {
    style: "currency",
    currency: COURSE_CURRENCY,
    ...options,
  }).format(cents / 100);
}
