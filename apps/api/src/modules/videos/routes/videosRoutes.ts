import { Router } from "express";
import { ParamsIdSchema, VideoParentParamsSchema, VideoUploadBodySchema } from "@repo/contract";
import { CloudflareStreamWebhookSchema } from "@repo/contract";
import { handleAuth } from "api/middleware/auth";
import { validate } from "api/middleware/validate";
import { validateRawBody } from "api/middleware/validateRawBody";
import { validateWebhookSignature } from "api/middleware/validateWebhookSignature";
import { videosController } from "../controllers/videosController";

const router: Router = Router();

router.get(
  //
  "/:parentType/:parentId",
  handleAuth,
  validate(VideoParentParamsSchema, "params"),
  async (req, res) => {
    await videosController.getByParent(req, res);
  }
);

router.post(
  //
  "/uploads",
  handleAuth,
  validate(VideoUploadBodySchema),
  async (req, res) => {
    await videosController.initializeUpload(req, res);
  }
);

router.delete(
  //
  "/:id",
  handleAuth,
  validate(ParamsIdSchema, "params"),
  async (req, res) => {
    await videosController.deleteVideo(req, res);
  }
);

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
