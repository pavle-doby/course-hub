import { Router } from "express";

const router: Router = Router();

// GET /health → liveness check, no auth required
router.get(
  //
  "/",
  (_req, res) => {
    res.status(200).json({ status: "ok" });
  }
);

export default router;
