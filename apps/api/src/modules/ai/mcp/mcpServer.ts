import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiError, ErrorCode, ErrorCodeEnrollment } from "@repo/contract";
import { logger } from "api/logger";
import { courseTools, type CourseToolContext } from "../tools";

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
 * Builds the `ch_generate_course` prompt: the expected course tree shape and tone, ending
 * with an instruction to call `ch_create_course_draft`.
 *
 * @param args - Prompt arguments: course `topic`, optional `audience` and `lessonsPerTopic`
 * @returns Prompt text sent to the agent as a user message
 */
function generateCoursePrompt({
  topic,
  audience,
  lessonsPerTopic,
}: {
  topic: string;
  audience?: string;
  lessonsPerTopic?: string;
}): string {
  return [
    `Design a course about: ${topic}.`,
    `Audience: ${audience || "motivated beginners"}.`,
    "Structure it as a course → topics → lessons tree:",
    "- Course: a clear name (max 255 characters) and a 2-4 sentence description of what learners will be able to do.",
    `- 4-8 topics that build on each other, each with a short description and ${lessonsPerTopic || "3-5"} lessons.`,
    "- Each lesson: a concrete name and a description of 2-5 sentences covering what it teaches.",
    "Tone: clear, practical and encouraging. Avoid filler and marketing language.",
    "Before creating it, you may call ch_list_my_courses to avoid duplicating an existing course.",
    "When the outline is ready, call ch_create_course_draft with the whole tree in one call.",
  ].join("\n");
}

/**
 * Creates an MCP server with every course tool and the `ch_generate_course` prompt.
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

  server.registerPrompt(
    "ch_generate_course",
    {
      description: "Generate a complete draft course and save it with ch_create_course_draft.",
      argsSchema: {
        topic: z.string().describe("What the course teaches"),
        audience: z.string().optional().describe("Who the course is for"),
        lessonsPerTopic: z.string().optional().describe("Lessons per topic, e.g. 4"),
      },
    },
    (args) => ({
      messages: [{ role: "user", content: { type: "text", text: generateCoursePrompt(args) } }],
    })
  );

  return server;
}
