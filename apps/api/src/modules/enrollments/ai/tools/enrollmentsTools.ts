import { GetEnrolledCourseInputSchema, ListEnrolledCoursesInputSchema } from "@repo/contract";
import { enrollmentsService } from "api/modules/enrollments/services/enrollmentsService";
import { defineTool } from "api/modules/ai/tools/courseTool";

const DEFAULT_PAGE_SIZE = 20;

/** Lists the courses the user is enrolled in as a student. */
export const listEnrolledCoursesTool = defineTool({
  name: "ch_list_enrolled_courses",
  description:
    "List the courses the current user is enrolled in as a student, most recently enrolled first. " +
    "Returns { data: [{ publicId, name, description, creatorName, progressPercent, aiAccessEnabled }], " +
    "pagination }. `page` is 0-based. Only courses with `aiAccessEnabled: true` can be read with " +
    "ch_get_enrolled_course; for the others the creator hasn't allowed AI agent access.",
  input: ListEnrolledCoursesInputSchema,
  handler: async (ctx, { query, page = 0, limit = DEFAULT_PAGE_SIZE }) => {
    const courses = await enrollmentsService.getAllEnrolledCourses(ctx.authUserId, {
      page,
      limit,
      offset: page * limit,
      query,
    });
    return {
      data: courses.data.map(
        ({ publicId, name, description, creator, progressPercent, aiAccessEnabled }) => ({
          publicId,
          name,
          description,
          creatorName: creator
            ? [creator.firstName, creator.lastName].filter(Boolean).join(" ") || creator.username
            : null,
          progressPercent,
          aiAccessEnabled,
        })
      ),
      pagination: courses.pagination,
    };
  },
});

/** Gets an enrolled course as a topic/lesson tree, if its creator allows AI access. */
export const getEnrolledCourseTool = defineTool({
  name: "ch_get_enrolled_course",
  description:
    "Get a course the current user is enrolled in as a tree: the course with its topics in order, " +
    "each with its lessons in order (names, descriptions, 0-based positions). Use it to study, " +
    "summarize or quiz the user on the course. Pass the `publicId` from ch_list_enrolled_courses. " +
    "Read-only. Fails if the user isn't enrolled or the creator hasn't enabled AI access.",
  input: GetEnrolledCourseInputSchema,
  handler: async (ctx, { publicId }) => {
    return await enrollmentsService.getEnrolledCourseTreeForAi(ctx.authUserId, publicId);
  },
});
