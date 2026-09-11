import { auth } from "./auth";
import { common } from "./common";
import { courses } from "./courses";
import { home } from "./home";
import { invite } from "./invite";
import { learn } from "./learn";
import { lessons } from "./lessons";
import { metadata } from "./metadata";
import { nav } from "./nav";
import { profile } from "./profile";
import { students } from "./students";
import { user } from "./user";

const en = {
  ...common,
  metadata,
  auth,
  courses,
  home,
  invite,
  learn,
  lessons,
  nav,
  profile,
  students,
  user,
};

export default en;
