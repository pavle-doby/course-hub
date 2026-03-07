import { Router, Request, Response } from "express";
import { authController } from "../controllers/authController";
import { validate } from "api/middleware/validate";
import { AuthSchemaLogin, AuthSchemaSignUp } from "../validation/schemas";

const router: Router = Router();

// POST /auth/signup → create a new user
router.post(
  "/signup",
  validate(AuthSchemaSignUp),
  async (req: Request, res: Response) => {
    await authController.signUp(req, res);
  },
);

// POST /auth/login → sign in user
router.post(
  "/login",
  validate(AuthSchemaLogin),
  async (req: Request, res: Response) => {
    await authController.logIn(req, res);
  },
);

// POST /auth/signout → sign out user
router.post("/signout", async (req: Request, res: Response) => {
  await authController.signOut(req, res);
});

// POST /auth/refresh → refresh access token using refresh token
router.post("/refresh", async (req: Request, res: Response) => {
  await authController.refreshToken(req, res);
});

export default router;
