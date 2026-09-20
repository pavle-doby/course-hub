import { Router } from "express";
import {
  CompleteVideoUploadParamsSchema,
  ParamsIdSchema,
  VideoParentParamsSchema,
  VideoUploadBodySchema,
} from "@repo/contract";
import { validate } from "api/middleware/validate";
import { videosController } from "../controllers/videosController";

const router: Router = Router();

// GET /videos/:parentType/:parentId → videos for a content item
router.get(
  //
  "/:parentType/:parentId",
  validate(VideoParentParamsSchema, "params"),
  async (req, res) => {
    await videosController.getByParent(req, res);
  }
);

// POST /videos/uploads → initialize an R2 upload for a video
router.post(
  //
  "/uploads",
  validate(VideoUploadBodySchema),
  async (req, res) => {
    await videosController.initializeUpload(req, res);
  }
);

// POST /videos/uploads/:id/complete → complete a video upload and publish it
router.post(
  //
  "/uploads/:id/complete",
  validate(CompleteVideoUploadParamsSchema, "params"),
  async (req, res) => {
    await videosController.completeUpload(req, res);
  }
);

// DELETE /videos/:id → delete a video from R2 and the database
router.delete(
  //
  "/:id",
  validate(ParamsIdSchema, "params"),
  async (req, res) => {
    await videosController.deleteVideo(req, res);
  }
);

export default router;
