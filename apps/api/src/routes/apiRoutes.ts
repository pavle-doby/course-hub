import { Router } from "express";

import { handleAuth } from "../middleware/auth";

import authRoutes from "../modules/auth/routes/authRoutes";
import usersRoutes from "../modules/users/routes/usersRoutes";
import coursesRoutes from "../modules/courses/routes/coursesRoutes";
import coursesPublicRoutes from "../modules/courses/routes/coursesPublicRoutes";
import lessonsRoutes from "../modules/lessons/routes/lessonsRoutes";
import topicsRoutes from "../modules/topics/routes/topicsRoutes";

const api: Router = Router();

api.use(
  //
  "/v1/auth",
  authRoutes
);
api.use(
  //
  "/v1/users",
  handleAuth,
  usersRoutes
);
api.use(
  //
  "/v1/public/courses",
  coursesPublicRoutes
);
api.use(
  //
  "/v1/courses",
  handleAuth,
  coursesRoutes
);
api.use(
  //
  "/v1/lessons",
  handleAuth,
  lessonsRoutes
);
api.use(
  //
  "/v1/topics",
  handleAuth,
  topicsRoutes
);

export default api;
