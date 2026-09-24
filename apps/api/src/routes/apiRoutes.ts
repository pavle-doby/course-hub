import { Router } from "express";

import usersRoutes from "../modules/users/routes/usersRoutes";
import coursesRoutes from "../modules/courses/routes/coursesRoutes";
import lessonsRoutes from "../modules/lessons/routes/lessonsRoutes";
import topicsRoutes from "../modules/topics/routes/topicsRoutes";
import enrollmentsRoutes from "../modules/enrollments/routes/enrollmentsRoutes";
import invitationsRoutes from "../modules/invitations/routes/invitationsRoutes";
import videosRoutes from "../modules/videos/routes/videosRoutes";
import documentsRoutes from "../modules/documents/routes/documentsRoutes";
import notificationsRoutes from "../modules/notifications/routes/notificationsRoutes";
import progressRoutes from "../modules/progress/routes/progressRoutes";
import apiTokensRoutes from "../modules/api-tokens/routes/apiTokensRoutes";
import oauthRoutes from "../modules/oauth/routes/oauthRoutes";

const api: Router = Router();

api.use(
  //
  "/v1/videos",
  videosRoutes
);

api.use(
  //
  "/v1/documents",
  documentsRoutes
);

api.use(
  //
  "/v1/users",
  usersRoutes
);

api.use(
  //
  "/v1/courses",
  coursesRoutes
);

api.use(
  //
  "/v1/lessons",
  lessonsRoutes
);

api.use(
  //
  "/v1/topics",
  topicsRoutes
);

api.use(
  //
  "/v1/enrollments",
  enrollmentsRoutes
);

api.use(
  //
  "/v1/invitations",
  invitationsRoutes
);

api.use(
  //
  "/v1/notifications",
  notificationsRoutes
);

api.use(
  //
  "/v1/progress",
  progressRoutes
);

api.use(
  //
  "/v1/api-tokens",
  apiTokensRoutes
);

api.use(
  //
  "/v1/oauth",
  oauthRoutes
);

export default api;
