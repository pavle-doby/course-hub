# Feature: Enroll in a Course

**Status:** Draft

## Overview

Allows a user to follow a course and track their progress through it. Progress is recorded per Block (Topic and Lesson) so the user always knows what they have and have not completed. Lesson completion is determined automatically when the user fully watches the Lesson's required video. Topic and Course completion is derived from the completion state of their child Blocks. In addition to per-block tracking, progress is aggregated on daily, weekly, monthly, and overall bases so the user can review their learning activity over time.

## Completion Rules

| Block      | Completed when…                                                              |
| ---------- | ---------------------------------------------------------------------------- |
| **Lesson** | The user has fully watched the Lesson's video (watch progress reaches 100%). |
| **Topic**  | All Lessons inside the Topic are completed.                                  |
| **Course** | All Topics (and any top-level Lessons) inside the Course are completed.      |

A Lesson that does not yet have a video attached cannot be completed. Every Lesson must have a video; this is enforced at the content level (see Create Course spec).

## User Stories

- As a **user**, I can enroll in a course so that I can start tracking my progress through it.
- As a **user**, I can un-enroll from a course so that it is removed from my active courses.
- As a **user**, when I finish watching a Lesson's video, the Lesson is automatically marked as complete so that my progress is recorded without manual action.
- As a **user**, I can see my completion status for each Block so that I know which parts of the course I have finished.
- As a **user**, I can see a Topic marked as complete when all of its Lessons are done so that I have a clear sense of section-level progress.
- As a **user**, I can see a Course marked as complete when all of its Blocks are done so that I know I have finished the entire course.
- As a **user**, I can see my overall progress for a course (e.g. percentage of Blocks completed) so that I can gauge how far along I am.
- As a **user**, I can see a summary of my learning activity per day so that I can review what I completed on a given date.
- As a **user**, I can see a weekly summary of my progress so that I can track my consistency across the week.
- As a **user**, I can see a monthly summary of my progress so that I can understand my long-term learning habits.
- As a **user**, I can see my overall all-time progress across all enrolled courses so that I have a complete picture of my learning history.
