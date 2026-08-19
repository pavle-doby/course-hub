import {
  initServerI18next,
  getT,
  getResources,
  generateI18nStaticParams,
} from "next-i18next/server";
import { createProxy } from "next-i18next/proxy";
import webConfig from "./config.web";

export { LOCALES as locales, DEFAULT_LOCALE as defaultLocale } from "./constants";
export { initServerI18next, getT, getResources, generateI18nStaticParams, createProxy };

export default webConfig;
