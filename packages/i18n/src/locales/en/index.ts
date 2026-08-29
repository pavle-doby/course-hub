import { auth } from "./auth";
import { common } from "./common";
import { courses } from "./courses";
import { home } from "./home";
import { lessons } from "./lessons";
import { metadata } from "./metadata";
import { nav } from "./nav";
import { user } from "./user";

const en = {
  ...common,
  metadata,
  auth,
  courses,
  home,
  lessons,
  nav,
  user,
};

export default en;
