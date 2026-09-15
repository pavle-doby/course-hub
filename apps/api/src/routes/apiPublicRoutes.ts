import { Router } from "express";
import authRoutes from "../modules/auth/routes/authRoutes";
import coursesPublicRoutes from "../modules/courses/routes/coursesPublicRoutes";
import documentsPublicRoutes from "../modules/documents/routes/documentsPublicRoutes";
import invitationsPublicRoutes from "../modules/invitations/routes/invitationsPublicRoutes";
import healthRoutes from "../modules/health/routes/healthRoutes";
import videosPublicRoutes from "../modules/videos/routes/videosPublicRoutes";

const apiPublic: Router = Router();

apiPublic.use(
  //
  "/v1/auth",
  authRoutes
);

apiPublic.use(
  //
  "/v1/health",
  healthRoutes
);

apiPublic.use(
  //
  "/v1/public/videos",
  videosPublicRoutes
);

apiPublic.use(
  //
  "/v1/public/courses",
  coursesPublicRoutes
);

apiPublic.use(
  //
  "/v1/public/documents",
  documentsPublicRoutes
);

apiPublic.use(
  //
  "/v1/public/invitations",
  invitationsPublicRoutes
);

export default apiPublic;
