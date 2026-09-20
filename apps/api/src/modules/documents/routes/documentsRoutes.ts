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

// POST /documents/uploads → initialize an R2 upload for a document
router.post(
  //
  "/uploads",
  validate(DocumentUploadBodySchema),
  async (req, res) => {
    await documentsController.initializeUpload(req, res);
  }
);

// POST /documents/uploads/:id/complete → complete an R2 upload and publish the document
router.post(
  //
  "/uploads/:id/complete",
  validate(DocumentUploadParamsSchema, "params"),
  async (req, res) => {
    await documentsController.completeUpload(req, res);
  }
);

// PUT /documents/:parentType/:parentId/order → persist document order for one content item
router.put(
  //
  "/:parentType/:parentId/order",
  validate(DocumentParentParamsSchema, "params"),
  validate(DocumentReorderBodySchema),
  async (req, res) => {
    await documentsController.reorder(req, res);
  }
);

// DELETE /documents/:id → delete a document from R2 and the database
router.delete(
  //
  "/:id",
  validate(ParamsIdSchema, "params"),
  async (req, res) => {
    await documentsController.delete(req, res);
  }
);

export default router;
