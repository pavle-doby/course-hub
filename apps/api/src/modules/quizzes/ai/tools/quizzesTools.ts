import { QuizParentParamsSchema, SaveQuizInputSchema } from "@repo/contract";
import { quizzesService } from "api/modules/quizzes/services/quizzesService";
import { defineTool } from "api/modules/ai/tools/courseTool";

/** Gets the quiz on a course, topic or lesson, with the correct answers. */
export const getQuizTool = defineTool({
  name: "ch_get_quiz",
  description:
    "Get the quiz on a course, topic or lesson in one of the user's courses, including which " +
    "choices are correct. `parentType` is course, topic or lesson; get the `parentId` from " +
    "ch_get_course. Read-only. Returns { quiz: { id, questions, updatedAt } | null }.",
  input: QuizParentParamsSchema,
  handler: async (ctx, parent) => {
    return await quizzesService.getQuiz(parent, ctx.authUserId);
  },
});

/** Creates or replaces the whole quiz on a course, topic or lesson. */
export const saveQuizTool = defineTool({
  name: "ch_save_quiz",
  description:
    "Create or replace the quiz on a course, topic or lesson in one of the user's courses. The " +
    "`questions` array replaces the whole quiz, so call ch_get_quiz first to edit an existing one. " +
    "Learners see it right away. Question types: `single` (exactly one correct choice), `multiple` " +
    "(at least one correct choice), each with 2-6 choices; `text` (free answer, no choices, not " +
    "graded). Give every question a short unique `id` (e.g. q1) and every choice a short unique " +
    "`value` (e.g. a, b, c). Aim for 3-5 questions that test understanding of the content from " +
    "ch_get_course. Returns { id, questions, updatedAt }.",
  input: SaveQuizInputSchema,
  handler: async (ctx, { parentType, parentId, questions }) => {
    return await quizzesService.saveQuiz({ parentType, parentId }, { questions }, ctx.authUserId);
  },
});

/** Deletes the quiz on a course, topic or lesson, with every learner's answers. */
export const deleteQuizTool = defineTool({
  name: "ch_delete_quiz",
  description:
    "Delete the quiz on a course, topic or lesson in one of the user's courses, together with " +
    "every learner's saved answers. Cannot be undone. Returns { deleted: true }.",
  input: QuizParentParamsSchema,
  handler: async (ctx, parent) => {
    await quizzesService.deleteQuiz(parent, ctx.authUserId);
    return { deleted: true };
  },
});
