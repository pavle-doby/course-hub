# Cloudflare Stream Video Plan

## Data Model

Videos can now belong to exactly one course, topic, or lesson.

`packages/db-schema/src/schemas/videos.ts` contains nullable `courseId`, `topicId`, and `lessonId` foreign keys. The database enforces:

- Each video has exactly one parent with `videos_exactly_one_parent`.
- Each course, topic, and lesson has at most one video through unique parent keys.
- Deleting the selected parent cascades to its video record.

The parent foreign keys remain in `videos`; no `videoId` columns are needed in `courses`, `topics`, or `lessons`. Drizzle exposes the inverse one-to-one `video` relation from every content item.

`storagePath` should be renamed to `streamUid` before Cloudflare implementation. Stream exposes a video UID, not a storage path. Add these Stream fields to `videos`:

- `status`: `uploading`, `processing`, `ready`, or `error`.
- `thumbnailUrl`: nullable text.
- `errorMessage`: nullable text.

Do not persist signed playback tokens or signed player URLs.

Lesson videos use the existing `lesson_progress` table for resume and completion. Course and topic video progress is out of scope for the first release.

## Server Configuration

Add server-only API environment values:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_STREAM_API_TOKEN`
- `CLOUDFLARE_STREAM_CUSTOMER_CODE`
- `CLOUDFLARE_STREAM_WEBHOOK_SECRET`

Configure allowed Stream embed origins for production and local web domains. Never expose the API token to clients.

## API

Install the official Cloudflare TypeScript SDK in the API package with `pnpm --filter api add cloudflare`.

Create `apps/api/src/modules/videos/` with the normal controller, service, repository, routes, and OpenAPI layout. Create one server-only `Cloudflare` SDK client from `CLOUDFLARE_STREAM_API_TOKEN`; keep Stream SDK calls in a small video service rather than controllers or repositories. Use its typed Stream methods for direct-upload creation, video status/deletion, and signed-token creation. Map SDK failures to the existing typed application errors; do not leak Cloudflare error responses to clients.

### Upload Initialization

`POST /v1/videos/upload`

Request: parent type (`course`, `topic`, or `lesson`), parent ID, file name, MIME type, size, and maximum expected duration.

The service must:

1. Resolve the selected parent and its owning course.
2. Verify the authenticated requester owns that course.
3. Reject or replace the existing video for the selected parent.
4. Request a one-time Cloudflare Direct Creator Upload URL with `requireSignedURLs`, allowed origins, metadata, and a duration limit.
5. Insert or update the one video record with its parent ID, Stream UID, name, and `uploading` status.
6. Return the upload URL and Course Hub video ID.

The browser uploads directly to Cloudflare. Video bytes must not pass through Express, Supabase Storage, or PostgreSQL.

For the MVP, replacement deletes the existing Stream asset, then updates the single video row with the new Stream UID and `uploading` status. The parent video is unavailable while replacement processing completes.

### Stream Webhook

`POST /api/v1/videos/webhook`

Configure this as the account-level Cloudflare Stream webhook URL. Read the raw body before JSON parsing and verify `Webhook-Signature` with HMAC-SHA256 plus constant-time comparison. Reject stale or invalid signatures.

Match Cloudflare's UID to `videos.streamUid`, then store status, duration, thumbnail, and processing error. Playback is allowed only when `readyToStream` is true and status is `ready`.

### Playback Authorization

`GET /v1/enrollments/courses/:publicId/videos/:videoId`

The service must verify that the video belongs directly to the course, one of its topics, or one of its lessons; that it is ready; and that the requester has an active enrollment or owns the course for preview.

Return a short-lived Cloudflare signed token and expiry, or a player URL built from that token. MVP uses Cloudflare's `/token` endpoint. Generate RS256 tokens locally only when playback volume requires it.

### Progress

Add a protected lesson-progress upsert endpoint. Call it only for a video attached to a lesson, every 15-30 seconds, on pause, and on completion. Mark a lesson complete around 90-95% watched.

## Web Authoring

Add a video section to `CourseWorkingArea` for every selected course, topic, and lesson. The selected item must first exist, so it has an ID.

The flow is:

1. Call the generated upload-initialization hook.
2. Upload to the returned Cloudflare one-time URL.
3. Display upload progress and `uploading`/`processing`/`ready`/`error` state.
4. Support replace and remove.

Use basic multipart POST for reliable files below 200 MB. Use `tus-js-client` for files above 200 MB and resumable uploads. This direct request is the intentional exception to generated API hooks because it targets Cloudflare's single-use URL.

## Web Learning

Extend enrolled course, topic, and lesson responses with non-sensitive video metadata: Course Hub video ID, name, status, duration, and thumbnail. Do not include playback tokens.

When a selected item has a ready video, `LearnWorkingArea` obtains a short-lived token from the generated playback hook and embeds the Cloudflare Stream player. For lesson videos, start at `progressSeconds` and report progress. Course and topic videos play without progress tracking in the MVP.

Non-enrolled visitors cannot request playback tokens. Show localized processing or unavailable states for missing or non-ready videos.

## Authorization

Correct the existing course and lesson update/delete authorization gap before video authoring: services must verify that an entity belongs to the authenticated creator, not only that it exists.

- Only the course owner can create, replace, or remove videos on the course, its topics, or its lessons.
- Only active enrollees and the course owner can obtain playback tokens.
- Withdrawn learners cannot obtain new tokens.
- Private-course invitees can play videos only after enrollment.

## Delivery Order

1. Apply migration `0008_add-video-parents.sql`.
2. Rename `storagePath`, add Stream status fields, and generate its migration.
3. Add contract schemas/types/errors and OpenAPI endpoints.
4. Run `pnpm api-client:generate`.
5. Install and configure the `cloudflare` SDK, then implement Cloudflare upload, webhook, playback, and deletion services.
6. Add web authoring and learner player UI.

## Tests

- The database rejects a video with zero or multiple parents.
- The database rejects a second video for the same course, topic, or lesson.
- Parent deletion cascades to its video record.
- Only course owners can initialize or replace uploads.
- Invalid or stale Stream webhooks fail verification.
- Enrolled users and creators can play; public visitors and withdrawn users cannot.
- Lesson progress resumes and completes correctly.
