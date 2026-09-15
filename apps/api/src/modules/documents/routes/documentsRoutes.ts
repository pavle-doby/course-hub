import { Router } from "express";
import {
  DocumentParentParamsSchema,
  DocumentReorderBodySchema,
  DocumentUploadBodySchema,
  DocumentUploadParamsSchema,
  ParamsIdSchema,
} from "@repo/contract";
import { validate } from "api/middleware/validate";
import { documentsController } from "../controllers/documentsController";

const router: Router = Router();

router.post(
  // Upload credentials are only issued to course creators.
  "/uploads",
  validate(DocumentUploadBodySchema),
  async (req, res) => {
    await documentsController.initializeUpload(req, res);
  }
);

router.post(
  // Completion validates the R2 object before publishing it.
  "/uploads/:id/complete",
  validate(DocumentUploadParamsSchema, "params"),
  async (req, res) => {
    await documentsController.completeUpload(req, res);
  }
);

router.put(
  // Persist document order for one content item.
  "/:parentType/:parentId/order",
  validate(DocumentParentParamsSchema, "params"),
  validate(DocumentReorderBodySchema),
  async (req, res) => {
    await documentsController.reorder(req, res);
  }
);

router.delete(
  // Removing the database record happens only after R2 deletion succeeds.
  "/:id",
  validate(ParamsIdSchema, "params"),
  async (req, res) => {
    await documentsController.delete(req, res);
  }
);

export default router;
