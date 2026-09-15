import { Router } from "express";
import { DocumentParentParamsSchema } from "@repo/contract";
import { validate } from "api/middleware/validate";
import { documentsController } from "../controllers/documentsController";

const router: Router = Router();

router.get(
  // Public documents for one course, topic, or lesson.
  "/:parentType/:parentId",
  validate(DocumentParentParamsSchema, "params"),
  async (req, res) => {
    await documentsController.getByParent(req, res);
  }
);

export default router;
