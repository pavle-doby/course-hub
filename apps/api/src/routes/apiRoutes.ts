import { Router } from "express";

import { handleAuth } from "../middleware/auth";

import authRoutes from "../modules/auth/routes/authRoutes";
import usersRoutes from "../modules/users/routes/usersRoutes";
import coursesRoutes from "../modules/courses/routes/coursesRoutes";
import coursesPublicRoutes from "../modules/courses/routes/coursesPublicRoutes";
import lessonsRoutes from "../modules/lessons/routes/lessonsRoutes";
import topicsRoutes from "../modules/topics/routes/topicsRoutes";
import enrollmentsRoutes from "../modules/enrollments/routes/enrollmentsRoutes";
import invitationsRoutes from "../modules/invitations/routes/invitationsRoutes";
import invitationsPublicRoutes from "../modules/invitations/routes/invitationsPublicRoutes";

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
api.use(
  //
  "/v1/enrollments",
  handleAuth,
  enrollmentsRoutes
);
api.use(
  //
  "/v1/public/invitations",
  invitationsPublicRoutes
);
api.use(
  //
  "/v1/invitations",
  handleAuth,
  invitationsRoutes
);

export default api;
