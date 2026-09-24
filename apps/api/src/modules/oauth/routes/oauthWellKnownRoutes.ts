import { Router, type Request, type Response } from "express";
import { oauthController } from "../controllers/oauthController";

const router: Router = Router();

// GET /.well-known/oauth-protected-resource[/apix/v1/mcp] → where MCP clients log in
router.get(
  //
  "/oauth-protected-resource{/*path}",
  (req: Request, res: Response) => {
    oauthController.getProtectedResourceMetadata(req, res);
  }
);

// GET /.well-known/oauth-authorization-server → OAuth endpoints and capabilities
router.get(
  //
  "/oauth-authorization-server",
  (req: Request, res: Response) => {
    oauthController.getAuthorizationServerMetadata(req, res);
  }
);

export default router;
