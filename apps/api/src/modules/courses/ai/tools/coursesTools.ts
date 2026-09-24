import {
  CreateCourseDraftInputSchema,
  GetCourseTreeInputSchema,
  ListMyCoursesInputSchema,
  SearchPublicCoursesInputSchema,
  UpdateCourseInputSchema,
} from "@repo/contract";
import { coursesService } from "api/modules/courses/services/coursesService";
import { defineTool } from "api/modules/ai/tools/courseTool";

const DEFAULT_PAGE_SIZE = 20;

/** Converts 0-based `page` / `limit` into pagination with an offset. */
function toPage({ page = 0, limit = DEFAULT_PAGE_SIZE }: { page?: number; limit?: number }) {
  return { page, limit, offset: page * limit };
}

/** Lists the user's own courses. */
export const listMyCoursesTool = defineTool({
  name: "ch_list_my_courses",
  description:
    "List the courses the current user created (drafts and published), newest first. " +
    "Returns { data: [{ id, publicId, name, description, status, visibility }], pagination }. " +
    "`page` is 0-based. Use a returned `id` with ch_get_course to read topics and lessons.",
  input: ListMyCoursesInputSchema,
  handler: async (ctx, { query, status, ...page }) => {
    const courses = await coursesService.getAllCourses(ctx.authUserId, {
      ...toPage(page),
      query,
      status,
    });
    return {
      data: courses.data.map(({ id, publicId, name, description, status, visibility }) => ({
        id,
        publicId,
        name,
        description,
        status,
        visibility,
      })),
      pagination: courses.pagination,
    };
  },
});

/** Gets one of the user's courses as a topic/lesson tree. */
export const getCourseTool = defineTool({
  name: "ch_get_course",
  description:
    "Get one of the current user's courses as a tree: the course with its topics in order, " +
    "each with its lessons in order (ids, names, descriptions, 0-based positions). " +
    "Pass exactly one of `courseId` or `publicId`. Call this before editing a course so you know " +
    "the current ids and positions. Only works for courses the user created.",
  input: GetCourseTreeInputSchema,
  handler: async (ctx, input) => {
    return await coursesService.getOwnedCourseTree(input, ctx.authUserId);
  },
});

/** Searches published courses (names and descriptions only). */
export const searchPublicCoursesTool = defineTool({
  name: "ch_search_public_courses",
  description:
    "Search published courses from all creators by name or description, e.g. for inspiration " +
    "or to avoid duplicates. Returns { data: [{ name, description }], pagination }. " +
    "`page` is 0-based. These courses can't be read in detail or edited.",
  input: SearchPublicCoursesInputSchema,
  handler: async (_ctx, { query, ...page }) => {
    const courses = await coursesService.getAllPublicCourses({ ...toPage(page), query });
    return {
      data: courses.data.map(({ name, description }) => ({ name, description })),
      pagination: courses.pagination,
    };
  },
});

/** Creates a draft course with topics and lessons in one transaction. */
export const createCourseDraftTool = defineTool({
  name: "ch_create_course_draft",
  description:
    "Create a new course with its topics and lessons in one call. Topic and lesson positions " +
    "follow array order. The course is always saved as an unpublished draft; the user publishes " +
    "it manually in the editor. Limits: up to 30 topics and 30 lessons per topic; names up to " +
    "255 characters. Returns the created course tree (same shape as ch_get_course).",
  input: CreateCourseDraftInputSchema,
  handler: async (ctx, input) => {
    return await coursesService.createCourseDraft(input, ctx.authUserId);
  },
});

/** Updates a course's name and/or description. */
export const updateCourseTool = defineTool({
  name: "ch_update_course",
  description:
    "Update the name and/or description of one of the user's courses. Never changes publish " +
    "status or visibility. Call ch_get_course first to get the `courseId`. " +
    "Returns { id, publicId, name, description, status, visibility }.",
  input: UpdateCourseInputSchema,
  handler: async (ctx, { courseId, ...data }) => {
    const course = await coursesService.updateCourse(courseId, data, ctx.authUserId);
    return {
      id: course?.id,
      publicId: course?.publicId,
      name: course?.name,
      description: course?.description,
      status: course?.status,
      visibility: course?.visibility,
    };
  },
});
