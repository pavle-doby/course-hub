import { AddTopicInputSchema, UpdateTopicInputSchema } from "@repo/contract";
import { topicsService } from "api/modules/topics/services/topicsService";
import { topicsRepository } from "api/modules/topics/repository/topicsRepository";
import { defineTool } from "api/modules/ai/tools/courseTool";

/** Adds a topic to a course, appending when `position` is omitted. */
export const addTopicTool = defineTool({
  name: "ch_add_topic",
  description:
    "Add a topic to one of the user's courses. Appends it at the end when `position` is omitted " +
    "(positions are 0-based). Never publishes the course. Call ch_get_course first to get the " +
    "`courseId` and current positions. Returns { id, courseId, name, description, position }.",
  input: AddTopicInputSchema,
  handler: async (ctx, { position, ...data }) => {
    return await topicsService.createTopic(
      { ...data, position: position ?? (await topicsRepository.getNextPosition(data.courseId)) },
      ctx.authUserId
    );
  },
});

/** Updates a topic's name, description and/or position. */
export const updateTopicTool = defineTool({
  name: "ch_update_topic",
  description:
    "Update a topic's name, description and/or 0-based position. Other topics are not " +
    "renumbered, so adjust them too when reordering. Never publishes the course. Call " +
    "ch_get_course first to get the `topicId`. Returns { id, courseId, name, description, position }.",
  input: UpdateTopicInputSchema,
  handler: async (ctx, { topicId, ...data }) => {
    return await topicsService.updateTopic(topicId, data, ctx.authUserId);
  },
});
