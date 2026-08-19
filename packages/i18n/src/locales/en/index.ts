import { auth } from "./auth";
import { common } from "./common";
import { home } from "./home";
import { metadata } from "./metadata";
import { user } from "./user";

const en = {
  ...common,
  metadata,
  auth,
  home,
  user,
};

export default en;
