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

router.get(
  //
  "/:parentType/:parentId",
  validate(VideoParentParamsSchema, "params"),
  async (req, res) => {
    await videosController.getByParent(req, res);
  }
);

router.post(
  //
  "/uploads",
  validate(VideoUploadBodySchema),
  async (req, res) => {
    await videosController.initializeUpload(req, res);
  }
);

router.post(
  //
  "/uploads/:id/complete",
  validate(CompleteVideoUploadParamsSchema, "params"),
  async (req, res) => {
    await videosController.completeUpload(req, res);
  }
);

router.delete(
  //
  "/:id",
  validate(ParamsIdSchema, "params"),
  async (req, res) => {
    await videosController.deleteVideo(req, res);
  }
);

export default router;
