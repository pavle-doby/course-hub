# Feature: Create Course

**Status:** Draft

## Overview

Enables a creator to build a new course by defining its structure through Blocks — Topics and Lessons that serve as the building blocks of a course. Each Block has a name, description, and can hold multiple media files. While editing, the creator can toggle auto-save to persist changes automatically. A persistent course tree panel is always visible, showing the full Block hierarchy and serving as navigation within the editor.

## Block Hierarchy

The course content is modelled as a tree of Blocks:

- **Course** — the root block. Holds course-level fields and owns all top-level child Blocks.
  - **Topic** — a grouping block that can contain Lesson child Blocks. Topics cannot be nested inside other Topics.
    - **Lesson** — a leaf block. It cannot have child Blocks of any kind. Every Lesson must have exactly one video; the video is required for the Lesson to be completable by followers.

Every Block (Topic and Lesson) shares the same base fields: `name`, `description`, and `media`.

## Course Fields

A course itself carries the following data:

| Field | Description |
|-------|-------------|
| `name` | Display title of the course. |
| `description` | Short summary describing what the course is about. |
| `media` | One or more media files attached to the course (e.g. cover image, intro video). |
| `createdAt` | Timestamp set when the course record is first created. |
| `publishedAt` | Timestamp set when the course is first moved to the `Published` state; `null` until then. |
| `lastUpdatedAt` | Timestamp updated whenever any field on the course (or its Blocks) is changed. |

## Course States

A course moves through the following states during its lifecycle:

| State | Description |
|-------|-------------|
| `Draft` | Course is being built and is not visible to anyone other than the creator. |
| `Published` | Course is live and visible to other users. |
| `Unpublished` | Course was previously published but is no longer visible to others; the creator can still access it. |
| `Deleted` | Course is hidden from everyone, including the creator. A soft delete is used — the record is retained in the database. |

## User Stories

- As a **creator**, I can create a new course so that I can share structured learning content with students.
- As a **creator**, I can add Topics and Lessons (Blocks) to my course so that I can organize content into a logical structure.
- As a **creator**, I can nest Lessons inside a Topic so that related content is grouped together.
- As a **creator**, I can give each Block a name, description, and attach multiple media files so that each section has rich, descriptive content.
- As a **creator**, I can toggle auto-save while editing so that my progress is saved without manual intervention.
- As a **creator**, I can always see the course tree while editing so that I can navigate between Blocks and understand the overall course structure at a glance.
- As a **creator**, I can publish a Draft course so that it becomes visible to other users.
- As a **creator**, I can unpublish a Published course so that it is hidden from other users without losing my content.
- As a **creator**, I can delete a course so that it is removed from my view, while the data is retained and recoverable.
