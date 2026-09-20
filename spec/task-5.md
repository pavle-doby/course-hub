# Task 5: Course Thumbnails

## Decisions

- A dedicated thumbnail overrides the existing video, attached-image, and gradient card fallback.
- The existing fallback sequence remains when a course has no dedicated thumbnail.
- Thumbnails can be replaced and removed in the first release.
- Thumbnails appear on course cards. A public course-detail hero is out of scope because no course-level banner exists today.
- R2 thumbnail objects use `course-hub/<user-id>/course-content/thumbnail/<course-id>/<uuid>`.

## Plan

- [x] Add a nullable `thumbnail_object_key` to `courses`; expose only a derived `thumbnailUrl`.
- [ ] Add the corresponding nullable database migration.
- [x] Add authenticated, course-owner-only initialize, complete, and remove thumbnail endpoints.
- [x] Verify uploads in R2, delete replaced/removed objects, and delete the thumbnail with its course.
- [x] Update course and enrollment response projections and OpenAPI, then regenerate the API client.
- [x] Add a course-only thumbnail uploader in the creator workspace.
- [x] Prefer `thumbnailUrl` in creator and public course cards while retaining existing fallbacks.
- [x] Run focused verification.
