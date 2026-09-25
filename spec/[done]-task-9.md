# Task 9: Course Reviews

Scope: enrolled learners rate a course 1–5 stars (1 = bad, 5 = best) with an optional comment. Anyone can read a course's reviews. The average rating shows on course cards and on the course overview in the reader.

Status legend: `[x]` done · `[ ]` todo · `[~]` needs the user (e.g. DB commands).

## Decisions

- **One review per learner per course, editable.** Submitting again overwrites it (upsert on `(userId, courseId)`). No delete for now.
- **Writing needs an active enrollment.** Reading the list is public, same as the rest of a published course's public info. A review survives withdraw, so it still counts.
- **Average and count are denormalized on `courses`** (`ratingAverage`, `ratingCount`) and recomputed in the same transaction as the review upsert. Every course query already selects all course columns, so cards, the catalog, the enrolled list and the reader get the rating without extra joins. Only the enrolled-courses query lists columns by hand, and it gains two columns.
- **Few new error codes.** Reuse `ErrorCodeEnrollment.COURSE_NOT_FOUND` and `ErrorCodeEnrollment.NOT_ENROLLED`, for review writes. Replies add `ErrorCodeReview.NOT_FOUND`.
- **Creator replies: one per review, stored on the review.** `reply` + `repliedAt` columns on `course_reviews`; only the reviewed course's creator can set them (`ErrorCode.FORBIDDEN` otherwise). A blank or `null` reply clears it. A missing review → `ErrorCodeReview.NOT_FOUND` (the one new error code, wired into `reviewErrorMessages.ts` and `errors.review.*` in `en`/`sr`).

## Supported Flows

| Trigger                                                      | Effect                                                                                  |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Enrolled learner clicks **Review** (next to Withdraw)        | Review dialog opens, prefilled with their existing review if any                        |
| Learner picks 1–5 stars, optional comment, submits           | Review upserted; course `ratingAverage`/`ratingCount` recomputed                        |
| Course turns done and the learner has no review yet          | Congratulations dialog shows **Review** instead of **Thank you**; opens the same dialog |
| Learner clicks **Reviews** at the bottom of the course tree  | Navigates to `/learn/:publicId/reviews` (all reviews, paginated)                        |
| Course creator clicks **Reply** / **Edit reply** on a review | Inline form under the review; save sets `reply`, **Delete reply** clears it             |
| Course overview in the reader / any course card              | Shows ★ average and review count (hidden when there are no reviews)                     |

## Data Model

`packages/db-schema/src/schemas/`:

- `course-reviews.ts` → `course_reviews`: `id`, `userId` (fk users, cascade), `courseId` (fk courses, cascade), `rating smallint not null` with a `check (rating between 1 and 5)`, `comment text` nullable, `reply text` nullable, `repliedAt` nullable, `createdAt`, `updatedAt`; `unique(userId, courseId)`.
- `courses.ts`: add `ratingAverage real not null default 0` and `ratingCount integer not null default 0`.
- Export from `schemas/index.ts`; add relations (`users.reviews`, `courses.reviews`, `courseReviews.user/course`); add `CourseReviewEntity` to `types.ts`.

Migration: **user runs** `pnpm db:generate --name course_reviews`.

## Contracts And API

`packages/contract/src/reviews/` (`schemas.ts`, `types.ts`, `index.ts`; re-exported from `src/index.ts`):

- `CourseReviewSchema`: `{ id, rating, comment, reply, repliedAt, createdAt, updatedAt, author: CourseCreatorSchema }`.
- `ReviewParamsSchema` `{ reviewId }`, `SaveReviewReplyBodySchema` `{ reply: string ≤ 2000 | null }`; `ErrorCodeReview` in `errors.ts`.
- `MyCourseReviewSchema`: `{ review: CourseReviewSchema.nullable() }`.
- `SaveCourseReviewBodySchema`: `{ rating: int 1..5, comment?: string ≤ 2000 | null }` (blank comment stored as null).
- `CourseSchema` gains `ratingAverage` and `ratingCount`.

`apps/api/src/modules/reviews/` (repository → service → controller → routes → openapi):

| Endpoint                                   | Behavior                                                                                |
| ------------------------------------------ | --------------------------------------------------------------------------------------- |
| `GET /v1/reviews/courses/:publicId/me`     | Current user's review for the course, or `{ review: null }`.                            |
| `PUT /v1/reviews/courses/:publicId`        | Requires active enrollment. One transaction: upsert review, recompute course avg/count. |
| `GET /v1/public/reviews/courses/:publicId` | Public, paginated, newest first, with author. Published courses only.                   |

Private routes mount at `/v1/reviews` (`apiRoutes.ts`), public at `/v1/public/reviews` (`apiPublicRoutes.ts`). OpenAPI file imported in `src/openapi/spec.ts`; `CourseReview` + `PaginatedCourseReviews` registered in `src/openapi/schemas.ts`. Then `pnpm api-client:generate` and re-export the `reviews` tag module.

## Web

- `apps/web/components/star-rating.tsx`: read-only `★ 4.3 (12)`; hidden when `count === 0`.
- `apps/web/app/learn/[publicId]/components/review-dialog.tsx`: five star buttons (radio group semantics), `Textarea` comment, Save. Prefills from `useGetMyCourseReview`; on success invalidates my-review, public-course and reviews queries.
- `learn-header.tsx`: **Review** button next to Withdraw (enrolled only).
- `course-completed-dialog.tsx`: `onReview` prop; when set (no review yet) the outline **Thank you** button becomes **Review**.
- `learn-tree-nav.tsx`: `SidebarFooter` with a **Reviews** link to `/learn/:publicId/reviews`.
- `learn-working-area.tsx`: `StarRating` under the course title on the course overview.
- `learn-course-card.tsx`: `StarRating` on the card.
- `apps/web/app/learn/[publicId]/reviews/page.tsx`: back button, course name, average, paginated review list (avatar, name, stars, date, comment) with `ChPagination`. Each review shows the creator's reply in an indented block; the course creator gets a **Reply** / **Edit reply** button that opens `reviews/components/review-reply-form.tsx` inline.
- `en` / `sr` strings under `learn.reviews.*`.

## Plan

- [x] 1. Spec (this file)
- [x] 2. DB schema: `course_reviews`, `courses.ratingAverage/ratingCount`, relations, entity type
- [~] 3. User runs `pnpm db:generate --name course_reviews` (and applies it; covers the reply columns too)
- [x] 4. Contract: `reviews/` schemas + types; `CourseSchema` rating fields; `EnrolledCourse` query columns
- [x] 5. API module `reviews/` (repo, service, controller, routes, openapi) + mounts + OpenAPI schemas
- [x] 6. `pnpm api-client:generate` + re-export `reviews`
- [x] 7. Web: `StarRating`, `ReviewDialog`, header button, completed-dialog Review, tree-nav Reviews link, course overview + card rating
- [x] 8. Web: reviews page `/learn/[publicId]/reviews`
- [x] 9. i18n `en` / `sr`
- [x] 10. Creator replies: columns, contract + `ErrorCodeReview`, `PUT /v1/reviews/:reviewId/reply`, reply form + display on the reviews page
- [x] 11. Verify: `pnpm typecheck`, `pnpm lint`, `pnpm build`; update FEATURES.md

## Open Questions

- Should creators be able to review their own course? Today they can't enroll in their own course in practice, so it isn't blocked explicitly.
- Sort/filter on the reviews page (by rating) and "top rated" catalog sort are left out.
