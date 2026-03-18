import { Router } from 'express';

import { handleAuth } from '../middleware/auth';

import authRoutes from '../modules/auth/routes/authRoutes';
import usersRoutes from '../modules/users/routes/usersRoutes';

const api: Router = Router();

api.use(
  '/v1/auth',
  //
  authRoutes
);
api.use(
  '/v1/users',
  //
  handleAuth,
  usersRoutes
);

export default api;
