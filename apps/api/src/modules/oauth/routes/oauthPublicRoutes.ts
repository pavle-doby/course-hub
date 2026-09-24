import express, { Router, type Request, type Response } from "express";
import { oauthController } from "../controllers/oauthController";

const router: Router = Router();

// POST /oauth/register → dynamic client registration (claude.ai, Claude Code)
router.post(
  //
  "/register",
  (req: Request, res: Response) => {
    oauthController.registerClient(req, res);
  }
);

// GET /oauth/authorize → validate, then redirect to the web app's consent page
router.get(
  //
  "/authorize",
  (req: Request, res: Response) => {
    oauthController.authorize(req, res);
  }
);

// POST /oauth/token → exchange an authorization code (form-encoded) for an access token
router.post(
  //
  "/token",
  express.urlencoded({ extended: false }),
  async (req: Request, res: Response) => {
    await oauthController.token(req, res);
  }
);

export default router;
