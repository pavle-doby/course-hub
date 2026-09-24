import { Router, type Request, type Response } from "express";
import { CreateApiTokenBodySchema, ParamsIdSchema } from "@repo/contract";
import { validate } from "api/middleware/validate";
import { apiTokensController } from "../controllers/apiTokensController";

const router: Router = Router();

// GET /api-tokens → active personal access tokens of the current user, newest first
router.get(
  //
  "/",
  async (req: Request, res: Response) => {
    await apiTokensController.getTokens(req, res);
  }
);

// POST /api-tokens → create a personal access token, plaintext returned once
router.post(
  //
  "/",
  validate(CreateApiTokenBodySchema),
  async (req: Request, res: Response) => {
    await apiTokensController.createToken(req, res);
  }
);

// DELETE /api-tokens/:id → revoke one of the current user's tokens
router.delete(
  //
  "/:id",
  validate(ParamsIdSchema, "params"),
  async (req: Request, res: Response) => {
    await apiTokensController.revokeToken(req, res);
  }
);

export default router;
