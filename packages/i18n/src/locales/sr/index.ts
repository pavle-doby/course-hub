import type { TranslationResources } from "../../types";
import { auth } from "./auth";
import { common } from "./common";
import { home } from "./home";
import { metadata } from "./metadata";
import { user } from "./user";

const sr: TranslationResources = {
  ...common,
  metadata,
  auth,
  home,
  user,
};

export default sr;
