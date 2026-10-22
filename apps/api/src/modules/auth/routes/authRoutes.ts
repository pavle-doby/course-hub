import { Router, Request, Response } from "express";
import { authController } from "../controllers/authController";
import { validate } from "api/middleware/validate";
import {
  AuthForgotPasswordQuerySchema,
  AuthLoginQuerySchema,
  AuthRefreshQuerySchema,
  AuthResetPasswordQuerySchema,
  AuthSignUpQuerySchema,
} from "@repo/contract";

const router: Router = Router();

// POST /auth/signup → create a new user
router.post(
  //
  "/signup",
  validate(AuthSignUpQuerySchema),
  async (req: Request, res: Response) => {
    await authController.signUp(req, res);
  }
);

// POST /auth/login → sign in user
router.post(
  //
  "/login",
  validate(AuthLoginQuerySchema),
  async (req: Request, res: Response) => {
    await authController.logIn(req, res);
  }
);

// POST /auth/signout → sign out user
router.post(
  //
  "/signout",
  async (req: Request, res: Response) => {
    await authController.signOut(req, res);
  }
);

// POST /auth/refresh → refresh access token using refresh token
router.post(
  //
  "/refresh",
  validate(AuthRefreshQuerySchema),
  async (req: Request, res: Response) => {
    await authController.refreshToken(req, res);
  }
);

// POST /auth/forgot-password → email a password reset link
router.post(
  //
  "/forgot-password",
  validate(AuthForgotPasswordQuerySchema),
  async (req: Request, res: Response) => {
    await authController.forgotPassword(req, res);
  }
);

// POST /auth/reset-password → set a new password using the emailed token hash
router.post(
  //
  "/reset-password",
  validate(AuthResetPasswordQuerySchema),
  async (req: Request, res: Response) => {
    await authController.resetPassword(req, res);
  }
);

export default router;
