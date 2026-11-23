import type { TranslationResources } from "../../types";
import { auth } from "./auth";
import { common } from "./common";
import { courses } from "./courses";
import { home } from "./home";
import { invite } from "./invite";
import { learn } from "./learn";
import { lessons } from "./lessons";
import { metadata } from "./metadata";
import { nav } from "./nav";
import { pricing } from "./pricing";
import { profile } from "./profile";
import { settings } from "./settings";
import { students } from "./students";
import { user } from "./user";

const sr: TranslationResources = {
  ...common,
  metadata,
  auth,
  courses,
  home,
  invite,
  learn,
  lessons,
  nav,
  pricing,
  profile,
  settings,
  students,
  user,
};

export default sr;
