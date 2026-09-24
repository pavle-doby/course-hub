import { Router, type Request, type Response } from "express";
import { mcpController } from "./mcpController";

const router: Router = Router();

// POST /mcp → MCP Streamable HTTP endpoint (stateless), personal access token required
router.post(
  //
  "/",
  async (req: Request, res: Response) => {
    await mcpController.handleRequest(req, res);
  }
);

// GET, DELETE /mcp → not supported in stateless mode
router.all(
  //
  "/",
  (req: Request, res: Response) => {
    mcpController.methodNotAllowed(req, res);
  }
);

export default router;
