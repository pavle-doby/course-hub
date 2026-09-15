# Cloudflare R2 Document Storage Plan

## Scope

Add web-only document attachments to courses, topics, and lessons. Course-item content is public. Only the course creator can upload, reorder, or delete attachments.

Supported files are images and PDFs. Attachments support multiple files per parent and drag-to-reorder.

## Storage Architecture

Use a private Cloudflare R2 bucket for uploads and a public R2 custom domain for finalized files.

1. The web app requests an upload session from the API.
2. The API validates the file and verifies the requester owns the selected parent course.
3. The API creates a pending document row and returns a short-lived presigned R2 `PUT` URL.
4. The browser uploads directly to R2. File bytes never pass through Express.
5. The browser confirms completion with the API.
6. The API uses R2 `HeadObject` to verify the object size and content type, then marks the document ready.
7. Public course pages use the document's public delivery URL.

Object keys must be server-generated opaque UUID paths, such as `courses/<course-id>/documents/<uuid>`. Do not use client-selected paths or expose R2 credentials.

## Cloudflare Setup

Provision a private R2 bucket and a least-privilege R2 API token restricted to that bucket. Configure a custom public delivery domain for ready objects.

Add server-only configuration to `apps/api/src/env.ts` and `apps/api/.env.example`:

- `CLOUDFLARE_R2_ACCOUNT_ID`
- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_R2_BUCKET`
- `CLOUDFLARE_R2_ENDPOINT`
- `CLOUDFLARE_R2_PUBLIC_URL`

Configure bucket CORS to allow direct `PUT` requests from the web origins, with only the required headers and no wildcard production origin.

Malware scanning is out of scope for this release. Restrict uploads to the validated image and PDF MIME types below.

## Data Model

Create a `documents` table in `packages/db-schema/src/schemas/documents.ts`.

- `id` UUID primary key.
- Nullable `courseId`, `topicId`, and `lessonId` foreign keys.
- A database check constraint requiring exactly one non-null parent, following the existing videos parent design.
- `uploadedByUserId` foreign key to users.
- Unique `objectKey`.
- `originalFileName`, `contentType`, and `sizeBytes`.
- `status`: `pending`, `ready`, or `failed`.
- `position` for stable display ordering.
- `createdAt` and `updatedAt` timestamps.

Add indexes for each parent foreign key and status, relations for users/courses/topics/lessons, and inverse `many(documents)` relations on the three parent entities. Generate a database migration from the schema source; do not hand-write or apply the migration.

## Contracts And API

Add a `documents` feature to `packages/contract` with Zod schemas, DTO types, and typed error codes for:

- Parent type and ID.
- Upload initialization: filename, MIME type, and size.
- Upload completion.
- Document DTO and list response.
- Document deletion.
- Reordering document IDs for a single parent.

Create `apps/api/src/modules/documents/` following the existing repository, service, controller, routes, and OpenAPI conventions. Every route uses `handleAuth`; validation reads from `res.locals`.

Endpoints:

- `GET /v1/documents/:parentType/:parentId`: list ready public documents in `position ASC, createdAt ASC` order.
- `POST /v1/documents/uploads`: creator-only upload initialization.
- `POST /v1/documents/uploads/:id/complete`: verify the R2 object and mark the document ready.
- `PUT /v1/documents/:parentType/:parentId/order`: creator-only atomic reorder.
- `DELETE /v1/documents/:id`: creator-only deletion.

Use the S3-compatible R2 API through `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`. Keep presigning, `HeadObject`, and object deletion in a small API-only R2 service. Do not reuse the legacy Supabase storage abstraction.

Register document schemas and paths in OpenAPI, import the module from the spec entrypoint, then run `pnpm api-client:generate`. Never manually edit `packages/api-client/src/generated/`.

## Authorization And Validation

For uploads, confirmation, deletion, and reordering, resolve the selected course/topic/lesson back to its owning course and require `course.creatorId === authenticatedUser.id`.

Listing is public because course-item content is public. Do not include pending or failed records in public responses.

Validate server-side during upload initialization and again at completion:

- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, and `application/pdf`.
- Reject SVG, HTML, archives, executables, and all unrecognized types.
- Normalize display names and reject path separators, control characters, and oversized names.
- The client never controls object keys, delivery URLs, owner IDs, or final file metadata.
- Verify expected object size and content type with `HeadObject` before readiness.

## Web Authoring

Add a document attachment component beside `apps/web/app/courses/components/media-input.tsx` and render it through `entity-form.tsx` for saved course, topic, and lesson entities.

The component must support:

- Selecting multiple images or PDFs.
- Per-file direct-upload progress and pending/ready/error states.
- Retry after upload failure.
- Creator-only deletion with confirmation.
- Filename, type, and size display.
- Drag-to-reorder persisted through the reorder endpoint.
- Generated document hooks for API calls and query invalidation after mutations.

Use a direct `XMLHttpRequest` or equivalent only for the presigned R2 upload so progress can be displayed. All API interactions use generated client hooks.

## Web Learning

Extend the learner-facing course-item data or query document lists from `apps/web/app/learn/[publicId]/components/learn-working-area.tsx`.

Render ready documents for the selected course, topic, or lesson using public URLs. Images can open in a new tab or preview in the established UI style. PDFs should use `Content-Disposition: attachment` by default to avoid inline active-content risks.

## Deletion And Cleanup

Use synchronous best-effort deletion for this release:

1. On explicit attachment deletion, delete the R2 object first, then delete its database row.
2. Treat R2 `NoSuchKey` as successful cleanup.
3. On parent deletion, enumerate child document keys and delete them before the parent record is removed.
4. If an R2 deletion fails, preserve the database record and return an error so the operation can be retried.

Configure an R2 lifecycle policy to remove stale unconfirmed uploads. This is the safety net for objects created during interrupted uploads. Introduce an outbox/queue/worker later only if attachment volume or deletion failure rates require durable asynchronous cleanup.

## Pending Limits

Confirm these defaults before implementation:

- Maximum image size: 10 MB.
- Maximum PDF size: 25 MB.
- Maximum documents per course, topic, or lesson: 20.

## Delivery Order

1. Provision R2, custom delivery domain, CORS, lifecycle policy, and API environment values.
2. Add document schema, relations, contract types/errors, and generate the migration.
3. Implement R2 service and protected document API routes.
4. Register OpenAPI and run `pnpm api-client:generate`.
5. Build authoring upload, delete, and reordering UI.
6. Build public learner document display.
7. Verify and run `pnpm build`, `pnpm lint`, and `pnpm typecheck`.

## Verification

- A course creator uploads multiple images/PDFs to each parent type.
- Non-creators cannot initialize, complete, reorder, or delete attachments.
- Public visitors see only ready documents.
- Invalid MIME types, oversized files, incomplete uploads, and metadata mismatches are rejected.
- Reordering persists and remains stable after refresh.
- Deleted documents no longer resolve publicly and their R2 object is removed.
- Parent deletion removes child objects or fails safely without losing the retry path.
