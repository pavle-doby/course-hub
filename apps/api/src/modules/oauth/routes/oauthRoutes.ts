import { Router, type Request, type Response } from "express";
import { OauthApproveBodySchema } from "@repo/contract";
import { validate } from "api/middleware/validate";
import { oauthController } from "../controllers/oauthController";

const router: Router = Router();

// POST /oauth/approve → the logged-in user allows or denies an OAuth client
router.post(
  //
  "/approve",
  validate(OauthApproveBodySchema),
  (req: Request, res: Response) => {
    oauthController.approve(req, res);
  }
);

export default router;
