import { Router } from "express";

import { handleTokenAuth } from "../middleware/tokenAuth";
import mcpRoutes from "../modules/ai/mcp/mcpRoutes";
import oauthPublicRoutes from "../modules/oauth/routes/oauthPublicRoutes";

// Routes used by external systems (not the web app); each mount picks its own auth
const apix: Router = Router();

apix.use(
  //
  "/v1/mcp",
  handleTokenAuth,
  mcpRoutes
);

// OAuth for MCP clients that log in themselves (claude.ai connectors, Claude Code)
apix.use(
  //
  "/oauth",
  oauthPublicRoutes
);

export default apix;
