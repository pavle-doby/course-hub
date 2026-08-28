import { Router } from "express";

import { handleAuth } from "../middleware/auth";

import authRoutes from "../modules/auth/routes/authRoutes";
import usersRoutes from "../modules/users/routes/usersRoutes";
import coursesRoutes from "../modules/courses/routes/coursesRoutes";

const api: Router = Router();

api.use(
  "/v1/auth",
  //
  authRoutes
);
api.use(
  "/v1/users",
  //
  handleAuth,
  usersRoutes
);
api.use(
  "/v1/courses",
  //
  handleAuth,
  coursesRoutes
);

export default api;
