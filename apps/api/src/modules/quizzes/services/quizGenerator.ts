import { randomUUID } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  ErrorCodeAi,
  GeneratedQuizSchema,
  QuizDraftSchema,
  ServiceUnavailableError,
  type CourseTree,
  type GenerateQuizRes,
  type QuizParentParams,
} from "@repo/contract";
import { env } from "api/env";
import { logger } from "api/logger";

const MODEL = env.QUIZ_MODEL || "claude-sonnet-5";
const CHOICE_VALUES = ["a", "b", "c", "d", "e", "f"];

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You write short quizzes for an online course platform. The creator will review and edit your draft before learners see it.

Write 3 to 5 questions about the content you are given:
- Test understanding of the material, not trivia about names or wording.
- Mostly "single" (exactly one correct choice) and "multiple" (one or more correct choices) questions, each with 3 or 4 choices and plausible wrong answers.
- At most one "text" question (an open reflection, no choices, not graded).
- Keep prompts under 200 characters and choices under 100 characters.
- Only ask about what the content covers. If it is thin, ask about the core ideas its names and descriptions imply.
- The creator may add instructions (focus, difficulty, style). Follow them as long as they fit the rules above.`;

const LANGUAGES: Record<string, string> = { en: "English", sr: "Serbian (Latin script)" };

// ##################################################################################
// #region Private Helpers
// ##################################################################################

function describeTree(tree: CourseTree, parent: QuizParentParams): string {
  const line = (label: string, item: { name: string; description: string | null }) =>
    `${label}: ${item.name}${item.description ? `\n${item.description}` : ""}`;

  if (parent.parentType === "course") {
    return [
      line("Course", tree),
      ...tree.topics.flatMap((topic) => [
        line("Topic", topic),
        ...topic.lessons.map((lesson) => line("Lesson", lesson)),
      ]),
    ].join("\n\n");
  }

  const topic =
    parent.parentType === "topic"
      ? tree.topics.find((item) => item.id === parent.parentId)
      : tree.topics.find((item) => item.lessons.some((lesson) => lesson.id === parent.parentId));
  if (!topic) {
    return line("Course", tree);
  }

  if (parent.parentType === "topic") {
    return [
      `Course: ${tree.name}`,
      line("Topic", topic),
      ...topic.lessons.map((lesson) => line("Lesson", lesson)),
    ].join("\n\n");
  }

  const lesson = topic.lessons.find((item) => item.id === parent.parentId)!;
  return [`Course: ${tree.name}`, `Topic: ${topic.name}`, line("Lesson", lesson)].join("\n\n");
}

// ##################################################################################
// #endregion Private Helpers
// ##################################################################################

export const quizGenerator = {
  /** Asks Claude for a 3–5 question draft. Writes nothing; ids and choice values are assigned here. */
  generateQuiz: async (
    tree: CourseTree,
    parent: QuizParentParams,
    language: string,
    instructions?: string
  ): Promise<GenerateQuizRes> => {
    const creatorInstructions = instructions
      ? `\n\n<creator_instructions>\n${instructions}\n</creator_instructions>`
      : "";
    let draft;
    try {
      const response = await client.messages.parse({
        model: MODEL,
        max_tokens: 16000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Write the quiz in ${LANGUAGES[language] ?? "English"} for this ${parent.parentType}:\n\n${describeTree(tree, parent)}${creatorInstructions}`,
          },
        ],
        output_config: { effort: "low", format: zodOutputFormat(QuizDraftSchema) },
      });
      draft = response.parsed_output;
    } catch (error) {
      logger.error({ error }, "Quiz generation failed");
    }

    const generated = GeneratedQuizSchema.safeParse({
      questions: (draft?.questions ?? []).map(({ type, prompt, description, choices }) => ({
        id: randomUUID(),
        type,
        prompt,
        description: description || undefined,
        required: true,
        ...(type === "text"
          ? {}
          : {
              choices: choices.map((choice, index) => ({
                value: CHOICE_VALUES[index] ?? `c${index}`,
                label: choice.label,
                correct: choice.correct,
              })),
            }),
      })),
    });
    if (!generated.success) {
      logger.warn({ issues: generated.error.issues }, "Quiz draft failed validation");
      throw new ServiceUnavailableError({ code: ErrorCodeAi.GENERATION_FAILED });
    }
    return generated.data;
  },
};
