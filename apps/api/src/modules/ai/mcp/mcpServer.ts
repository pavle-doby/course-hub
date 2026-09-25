import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiError, ErrorCode, ErrorCodeEnrollment } from "@repo/contract";
import { logger } from "api/logger";
import { courseTools, type CourseToolContext } from "../tools";
import { registerCoursePrompts } from "./mcpPrompts";

/**
 * Maps a tool error to a plain English message for the agent (agents read English, so it's
 * not localized). Unexpected errors are logged and get a generic message.
 *
 * @param error - Error thrown by a tool handler
 * @returns Message returned in the MCP `isError` result
 */
function toErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    logger.error({ error }, "MCP tool failed");
    return "The tool failed unexpectedly. Try again later.";
  }
  if (error.code === ErrorCode.FORBIDDEN) {
    return "Forbidden: you can only read or edit courses you created.";
  }
  if (error.code === ErrorCodeEnrollment.AI_ACCESS_DISABLED) {
    return "The creator of this course hasn't allowed it to be used in AI agents.";
  }
  if (error.code === ErrorCodeEnrollment.NOT_ENROLLED) {
    return "Not enrolled: check the publicId with ch_list_enrolled_courses.";
  }
  if (error.status === 404) {
    return `Not found (${error.code}). Check the id with ch_list_my_courses or ch_get_course.`;
  }
  return `Request failed (${error.code}).`;
}

/**
 * Creates an MCP server with every course tool and the course prompts (`mcpPrompts.ts`).
 * Stateless: one server per request, with the tools bound to the token owner.
 *
 * @param ctx - Token owner the tools act as
 * @returns Server ready to connect to a transport
 */
export function createMcpServer(ctx: CourseToolContext): McpServer {
  const server = new McpServer({ name: "course-hub", version: "1.0.0" });

  for (const tool of courseTools) {
    server.registerTool(
      tool.name,
      { description: tool.description, inputSchema: tool.input },
      async (input: unknown) => {
        try {
          const result = await tool.handler(ctx, input);
          return { content: [{ type: "text", text: JSON.stringify(result) }] };
        } catch (error) {
          return { content: [{ type: "text", text: toErrorMessage(error) }], isError: true };
        }
      }
    );
  }

  registerCoursePrompts(server);

  return server;
}
