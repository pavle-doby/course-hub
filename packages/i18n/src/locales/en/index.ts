import { auth } from "./auth";
import { common } from "./common";
import { home } from "./home";
import { metadata } from "./metadata";
import { nav } from "./nav";
import { user } from "./user";

const en = {
  ...common,
  metadata,
  auth,
  home,
  nav,
  user,
};

export default en;
