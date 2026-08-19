import type { I18nConfig } from "next-i18next/proxy";
import { DEFAULT_LOCALE, LOCALES } from "./constants";
import { baseConfig } from "./config.base";

const webConfig: I18nConfig = {
  defaultNS: baseConfig.defaultNS,
  supportedLngs: [...LOCALES],
  fallbackLng: DEFAULT_LOCALE,
  localeInPath: false,
  // Recommended: works on all platforms including Vercel/serverless
  resourceLoader: (language, _namespace) =>
    import(`./locales/${language}/index`).then((m) => m.default),
  // Disable caching in dev so HMR changes to locale files are reflected immediately
  ...(process.env.NODE_ENV === "development" && { cache: false }),
};

export default webConfig;
