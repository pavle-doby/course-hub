import { Router, Request, Response } from "express";
import { validate } from "api/middleware/validate";
import { pagination } from "api/middleware/pagination";
import {
  CreateEmailInvitationBodySchema,
  ParamsIdSchema,
  ParamsPublicIdSchema,
  ParamsTokenSchema,
  SearchSchema,
} from "@repo/contract";
import { invitationsController } from "../controllers/invitationsController";

const router: Router = Router();

// POST /invitations/courses/:publicId → invite a specific email to a private course
router.post(
  "/courses/:publicId",
  validate(ParamsPublicIdSchema, "params"),
  validate(CreateEmailInvitationBodySchema),
  async (req: Request, res: Response) => {
    await invitationsController.createEmailInvitation(req, res);
  }
);

// POST /invitations/courses/:publicId/link → generate a one-time enrollment link
router.post(
  "/courses/:publicId/link",
  validate(ParamsPublicIdSchema, "params"),
  async (req: Request, res: Response) => {
    await invitationsController.createLinkInvitation(req, res);
  }
);

// GET /invitations/courses/:publicId → list invitations for a course (creator only)
router.get(
  "/courses/:publicId",
  validate(ParamsPublicIdSchema, "params"),
  pagination(),
  validate(SearchSchema, "query"),
  async (req: Request, res: Response) => {
    await invitationsController.getAllInvitations(req, res);
  }
);

// DELETE /invitations/:id → revoke a pending invitation (creator only)
router.delete("/:id", validate(ParamsIdSchema, "params"), async (req: Request, res: Response) => {
  await invitationsController.revokeInvitation(req, res);
});

// POST /invitations/:token/accept → accept an invitation and enroll the current user
router.post(
  "/:token/accept",
  validate(ParamsTokenSchema, "params"),
  async (req: Request, res: Response) => {
    await invitationsController.acceptInvitation(req, res);
  }
);

export default router;
