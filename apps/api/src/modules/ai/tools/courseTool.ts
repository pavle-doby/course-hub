import { z } from "zod";

/** Who a tool acts as: internal `users.id` and the Supabase id the services expect. */
export type CourseToolContext = { userId: string; authUserId: string };

/** A typed course tool shared by MCP and the course-edit chat. */
export type CourseTool<Input extends z.ZodType = z.ZodType> = {
  name: string;
  /** Written for an LLM reader. */
  description: string;
  input: Input;
  handler(ctx: CourseToolContext, input: z.infer<Input>): Promise<unknown>;
};

/** Defines a tool, inferring the handler `input` type from its schema. */
export function defineTool<Input extends z.ZodType>(tool: CourseTool<Input>): CourseTool<Input> {
  return tool;
}
