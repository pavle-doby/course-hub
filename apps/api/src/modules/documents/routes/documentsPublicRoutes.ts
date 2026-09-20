import { Router } from "express";
import { DocumentParentParamsSchema } from "@repo/contract";
import { validate } from "api/middleware/validate";
import { documentsController } from "../controllers/documentsController";

const router: Router = Router();

// GET /public/documents/:parentType/:parentId → public documents for a course, topic, or lesson, no auth required
router.get(
  //
  "/:parentType/:parentId",
  validate(DocumentParentParamsSchema, "params"),
  async (req, res) => {
    await documentsController.getByParent(req, res);
  }
);

export default router;
