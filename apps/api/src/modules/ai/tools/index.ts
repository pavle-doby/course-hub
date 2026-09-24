import type { CourseTool } from "./courseTool";
import {
  createCourseDraftTool,
  getCourseTool,
  listMyCoursesTool,
  searchPublicCoursesTool,
  updateCourseTool,
} from "api/modules/courses/ai/tools/coursesTools";
import { addTopicTool, updateTopicTool } from "api/modules/topics/ai/tools/topicsTools";
import { addLessonTool, updateLessonTool } from "api/modules/lessons/ai/tools/lessonsTools";
import {
  getEnrolledCourseTool,
  listEnrolledCoursesTool,
} from "api/modules/enrollments/ai/tools/enrollmentsTools";

export type { CourseTool, CourseToolContext } from "./courseTool";

/** All course tools, shared by the MCP server (8.1) and the course-edit chat (8.2). */
export const courseTools: CourseTool[] = [
  listMyCoursesTool,
  getCourseTool,
  searchPublicCoursesTool,
  listEnrolledCoursesTool,
  getEnrolledCourseTool,
  createCourseDraftTool,
  addTopicTool,
  addLessonTool,
  updateCourseTool,
  updateTopicTool,
  updateLessonTool,
];
