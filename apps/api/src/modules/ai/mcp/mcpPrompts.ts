import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

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
 * Builds the `ch_review_course` prompt: review one of the user's courses and propose fixes,
 * applying them only after the user approves.
 *
 * @param args - Prompt arguments: `course` (id, publicId or name) and optional `focus`
 * @returns Prompt text sent to the agent as a user message
 */
function reviewCoursePrompt({ course, focus }: { course: string; focus?: string }): string {
  return [
    `Review my course: ${course}.`,
    "If that isn't a courseId or publicId, find the course with ch_list_my_courses first.",
    "Load it with ch_get_course, then review:",
    "- Course: does the name say what it teaches, and does the description state concrete outcomes?",
    "- Topics: logical order, no gaps or overlaps, each building on the previous one.",
    "- Lessons: concrete names, descriptions of 2-5 sentences, balanced count per topic.",
    focus ? `Pay extra attention to: ${focus}.` : "",
    "List the issues grouped by topic, each with a specific suggested rewrite.",
    "Don't change anything yet. Ask which suggestions to apply, then use ch_update_course,",
    "ch_update_topic, ch_update_lesson, ch_add_topic or ch_add_lesson.",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Builds the `ch_research_course` prompt: research a whole course, one topic or one lesson,
 * for a course the user created or is enrolled in. Read-only.
 *
 * @param args - Prompt arguments: `course` (id, publicId or name), optional `topic`, `lesson`
 *   and `goal`
 * @returns Prompt text sent to the agent as a user message
 */
function researchCoursePrompt({
  course,
  topic,
  lesson,
  goal,
}: {
  course: string;
  topic?: string;
  lesson?: string;
  goal?: string;
}): string {
  const scope = lesson
    ? `the lesson "${lesson}"${topic ? ` in the topic "${topic}"` : ""}`
    : topic
      ? `the topic "${topic}" and its lessons`
      : "the whole course";
  return [
    `Help me research ${scope} in the course: ${course}.`,
    goal ? `My goal: ${goal}.` : "",
    "Find the course: if I created it, use ch_list_my_courses and ch_get_course; if I'm enrolled",
    "in it, use ch_list_enrolled_courses and ch_get_enrolled_course.",
    "Use the names and descriptions in that scope as the research brief, then:",
    "- Explain the key concepts clearly, building from basics to the harder parts.",
    "- Go beyond the course text: add context, real-world examples and common misconceptions.",
    "- If you can search the web, find 3-5 high-quality sources (docs, articles, papers, videos)",
    "  and cite them with links. Never invent sources; say so if you can't search.",
    "- Point out anything in the course that looks outdated or incomplete.",
    "- End with a short summary and 3 questions I can use to check my understanding.",
    "This is read-only: don't change the course.",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Registers the course prompts: `ch_generate_course`, `ch_review_course` and
 * `ch_research_course`.
 *
 * @param server - Server to register the prompts on
 */
export function registerCoursePrompts(server: McpServer): void {
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

  server.registerPrompt(
    "ch_review_course",
    {
      description: "Review one of my courses and suggest improvements before applying them.",
      argsSchema: {
        course: z.string().describe("Course id, publicId or name"),
        focus: z.string().optional().describe("What to focus on, e.g. lesson descriptions"),
      },
    },
    (args) => ({
      messages: [{ role: "user", content: { type: "text", text: reviewCoursePrompt(args) } }],
    })
  );

  server.registerPrompt(
    "ch_research_course",
    {
      description:
        "Research a whole course, one topic or one lesson (created or enrolled) with explanations and sources.",
      argsSchema: {
        course: z.string().describe("Course id, publicId or name"),
        topic: z.string().optional().describe("Topic name, to research only that topic"),
        lesson: z.string().optional().describe("Lesson name, to research only that lesson"),
        goal: z.string().optional().describe("Why you're researching, e.g. exam prep"),
      },
    },
    (args) => ({
      messages: [{ role: "user", content: { type: "text", text: researchCoursePrompt(args) } }],
    })
  );
}
