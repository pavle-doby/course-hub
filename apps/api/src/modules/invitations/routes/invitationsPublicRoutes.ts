import { Router, Request, Response } from "express";
import { validate } from "api/middleware/validate";
import { ParamsTokenSchema } from "@repo/contract";
import { invitationsController } from "../controllers/invitationsController";

const router: Router = Router();

// GET /public/invitations/:token → look up an invitation by token, no auth required
router.get(
  //
  "/:token",
  validate(ParamsTokenSchema, "params"),
  async (req: Request, res: Response) => {
    await invitationsController.getInvitationInfo(req, res);
  }
);

export default router;
