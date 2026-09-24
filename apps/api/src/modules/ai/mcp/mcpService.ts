import type { IncomingMessage, ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { CourseToolContext } from "../tools";
import { createMcpServer } from "./mcpServer";

export const mcpService = {
  /**
   * Handles one MCP request in stateless mode: creates a server with the course tools bound
   * to `ctx`, connects it to a new Streamable HTTP transport, and closes both when the
   * response closes.
   *
   * @param ctx - Token owner the tools act as
   * @param req - Incoming HTTP request
   * @param res - HTTP response the transport writes the JSON-RPC result to
   * @param body - Parsed JSON-RPC body (validated by the transport)
   */
  handleRequest: async (
    ctx: CourseToolContext,
    req: IncomingMessage,
    res: ServerResponse,
    body: unknown
  ): Promise<void> => {
    const server = createMcpServer(ctx);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    res.on("close", () => {
      void transport.close();
      void server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  },
};
