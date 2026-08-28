import type { TranslationResources } from "../../types";
import { auth } from "./auth";
import { common } from "./common";
import { courses } from "./courses";
import { home } from "./home";
import { metadata } from "./metadata";
import { nav } from "./nav";
import { user } from "./user";

const sr: TranslationResources = {
  ...common,
  metadata,
  auth,
  courses,
  home,
  nav,
  user,
};

export default sr;
