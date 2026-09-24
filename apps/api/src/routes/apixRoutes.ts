import { Router } from "express";

import { handleTokenAuth } from "../middleware/tokenAuth";
import mcpRoutes from "../modules/ai/mcp/mcpRoutes";

// Routes used by external systems (not the web app); each mount picks its own auth
const apix: Router = Router();

apix.use(
  //
  "/v1/mcp",
  handleTokenAuth,
  mcpRoutes
);

export default apix;
