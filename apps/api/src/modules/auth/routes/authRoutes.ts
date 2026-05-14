import { Router, Request, Response } from 'express';
import { authController } from '../controllers/authController';
import { validate } from 'api/middleware/validate';
import {
  AuthLoginQuerySchema,
  AuthNativeRefreshQuerySchema,
  AuthSignUpQuerySchema,
} from '@my/contract';

const router: Router = Router();

// POST /auth/signup → create a new user
router.post('/signup', validate(AuthSignUpQuerySchema), async (req: Request, res: Response) => {
  await authController.signUp(req, res);
});

// POST /auth/login → sign in user
router.post('/login', validate(AuthLoginQuerySchema), async (req: Request, res: Response) => {
  await authController.logIn(req, res);
});

// POST /auth/signout → sign out user
router.post('/signout', async (req: Request, res: Response) => {
  await authController.signOut(req, res);
});

// POST /auth/refresh → refresh access token using refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  await authController.refreshToken(req, res);
});

// Native routes — tokens returned in body, no cookies

// POST /auth/signup/native → create a new user (native)
router.post(
  '/signup/native',
  validate(AuthSignUpQuerySchema),
  async (req: Request, res: Response) => {
    await authController.signUpNative(req, res);
  }
);

// POST /auth/login/native → sign in user (native)
router.post(
  '/login/native',
  validate(AuthLoginQuerySchema),
  async (req: Request, res: Response) => {
    await authController.logInNative(req, res);
  }
);

// POST /auth/signout/native → sign out user (native)
router.post('/signout/native', async (req: Request, res: Response) => {
  await authController.signOutNative(req, res);
});

// POST /auth/refresh/native → refresh tokens (native)
router.post(
  '/refresh/native',
  validate(AuthNativeRefreshQuerySchema),
  async (req: Request, res: Response) => {
    await authController.refreshTokenNative(req, res);
  }
);

export default router;
