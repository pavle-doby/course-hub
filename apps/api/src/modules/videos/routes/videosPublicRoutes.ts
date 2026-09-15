import { Router } from "express";
import { CloudflareStreamWebhookSchema } from "@repo/contract";
import { validateRawBody } from "api/middleware/validateRawBody";
import { validateWebhookSignature } from "api/middleware/validateWebhookSignature";
import { videosController } from "../controllers/videosController";

const router: Router = Router();

router.post(
  // Cloudflare signs this public callback before the payload is accepted.
  "/webhook",
  validateWebhookSignature,
  validateRawBody(CloudflareStreamWebhookSchema),
  async (req, res) => {
    await videosController.handleWebhook(req, res);
  }
);

export default router;
