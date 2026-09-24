import type { Request, Response } from "express";
import type { CourseToolContext } from "../tools";
import { mcpService } from "./mcpService";

export const mcpController = {
  handleRequest: async (req: Request, res: Response): Promise<void> => {
    const ctx: CourseToolContext = {
      userId: res.locals.userId as string,
      authUserId: res.locals.authUserId as string,
    };
    // MCP is its own protocol: the transport validates the JSON-RPC body itself
    const body: unknown = req.body;
    await mcpService.handleRequest(ctx, req, res, body);
  },

  methodNotAllowed: (_req: Request, res: Response): void => {
    res
      .status(405)
      .set("Allow", "POST")
      .json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Method not allowed." },
        id: null,
      });
  },
};
