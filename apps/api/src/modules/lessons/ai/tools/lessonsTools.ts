import { AddLessonInputSchema, UpdateLessonInputSchema } from "@repo/contract";
import { lessonsService } from "api/modules/lessons/services/lessonsService";
import { lessonsRepository } from "api/modules/lessons/repository/lessonsRepository";
import { defineTool } from "api/modules/ai/tools/courseTool";

/** Adds a lesson to a topic, appending when `position` is omitted. */
export const addLessonTool = defineTool({
  name: "ch_add_lesson",
  description:
    "Add a lesson to a topic in one of the user's courses. Appends it at the end of the topic " +
    "when `position` is omitted (positions are 0-based). Never publishes the course. Call " +
    "ch_get_course first to get the `topicId`. Returns { id, topicId, name, description, position }.",
  input: AddLessonInputSchema,
  handler: async (ctx, { position, ...data }) => {
    return await lessonsService.createLesson(
      { ...data, position: position ?? (await lessonsRepository.getNextPosition(data.topicId)) },
      ctx.authUserId
    );
  },
});

/** Updates a lesson's name, description and/or position. */
export const updateLessonTool = defineTool({
  name: "ch_update_lesson",
  description:
    "Update a lesson's name, description and/or 0-based position within its topic. Other " +
    "lessons are not renumbered, so adjust them too when reordering. Never publishes the course. " +
    "Call ch_get_course first to get the `lessonId`. " +
    "Returns { id, topicId, name, description, position }.",
  input: UpdateLessonInputSchema,
  handler: async (ctx, { lessonId, ...data }) => {
    return await lessonsService.updateLesson(lessonId, data, ctx.authUserId);
  },
});
