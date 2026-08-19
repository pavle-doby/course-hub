import type { Locale } from "./types";

export const LOCALES = ["sr", "en"] as const;

export const DEFAULT_LOCALE: Locale = "sr";
export const FALLBACK_LOCALE: Locale = "en";

export const DEFAULT_NS = "common" as const;
