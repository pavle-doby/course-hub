import { Router } from "express";
import { CloudflareStreamWebhookSchema, VideoCourseParentParamsSchema } from "@repo/contract";
import { validate } from "api/middleware/validate";
import { validateRawBody } from "api/middleware/validateRawBody";
import { validateWebhookSignature } from "api/middleware/validateWebhookSignature";
import { videosController } from "../controllers/videosController";

const router: Router = Router();

// GET /public/videos/:parentType/:parentId → public videos for a course, no auth required (topic/lesson videos stay behind auth)
router.get(
  //
  "/:parentType/:parentId",
  validate(VideoCourseParentParamsSchema, "params"),
  async (req, res) => {
    await videosController.getByParent(req, res);
  }
);

// POST /public/videos/webhook → Cloudflare Stream webhook callback
router.post(
  //
  "/webhook",
  validateWebhookSignature,
  validateRawBody(CloudflareStreamWebhookSchema),
  async (req, res) => {
    await videosController.handleWebhook(req, res);
  }
);

export default router;
