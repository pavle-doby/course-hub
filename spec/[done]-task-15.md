# Task 15: Plan Enforcement (backend)

Scope: **API first**, plus the small web changes needed so blocked actions read well. This is Phase 2 from [`[done]-task-14.md`]([done]-task-14.md): every user gets a plan, and the API enforces `PLAN_ENTITLEMENTS` (already in `@repo/contract/src/plans/`). No payments yet: plans are set by an admin endpoint. Payments are Phase 3, a later task.

Status legend: `[x]` done · `[ ]` todo · `[~]` needs the user (e.g. DB commands).

## Decisions

- **Two columns on `users`, no new tables.** `plan` (enum, default `free`) and `plan_version` (int, default `CURRENT_PLAN_VERSION` = 1). What a plan includes stays in code (`PLAN_ENTITLEMENTS[plan][version]`). See task 14 for why there's no per-user copy table.
- **One resolver.** `entitlementsService.get(user)` returns `PLAN_ENTITLEMENTS[user.plan][user.planVersion]`. Every check goes through it, so overrides (later) are a change in one function.
- **Checks live in services, not routes.** MCP tools call the same services (`coursesTools` → `coursesService.updateCourse`, OAuth → `apiTokensService.createToken`), so one check covers web, MCP and OAuth.
- **The user row is already loaded.** `handleAuth` only holds the Supabase user, but every gated service already calls `usersRepository.getUserByAuthUserId` (or `assertCreator` / `getOwnedCourse`, which do). Those return the full `UserEntity`, which now carries `plan` / `planVersion`, so there's no extra query. Where a helper returns only `userId`, it returns the user instead.
- **Errors:** new `ErrorCodePlans` enum, both 403 (`ForbiddenError`):
  - `FEATURE_NOT_IN_PLAN = "plans_feature_not_in_plan"`: an on/off feature is off (private course, AI access, review reply, MCP token, full students list, AI quiz on Free).
  - `LIMIT_REACHED = "plans_limit_reached"`: a numeric limit is used up (published courses, video minutes, document storage, AI quizzes per day).
- **Downgrade never deletes data.** Going from Pro to Free keeps everything that exists (published courses, private courses, videos, documents, replies). It only blocks **new** gated actions. Exception: **MCP tokens stop working** (`authenticate` checks `mcpAccess` on every call), because MCP is an ongoing Pro service, not stored content.
- **Video minutes are checked before upload, not after.** Duration is only known once Cloudflare processes the video, so `initializeUpload` blocks when `used >= limit`. `// ponytail:` one upload can overshoot the limit; the next one is blocked. Fine until someone abuses it.
- **AI quiz limit replaces `DAILY_GENERATION_LIMIT`.** `consumeAiUsage(userId, limit)` gets the plan's `aiQuizGenerationsDay`; `0` → `FEATURE_NOT_IN_PLAN` (no call made), `null` → no counter. The counter stays in memory until task 10.2 moves it to the DB.
- **The web reads the plan from `GET /v1/users/self`.** `User` gains `plan` and `planVersion`, and the web computes entitlements from the same contract constant. No new entitlements endpoint until overrides exist and the client can no longer compute it alone.
- **Plans are set by an admin endpoint**, `PUT /v1/users/:id/plan` (`validateRole("admin")`), so nobody has to run SQL by hand before payments exist.

## Data Model

```
                 enum plan: 'free' | 'pro' | 'enterprise'
                                 │
┌────────────────────────────────▼─────────────┐
│ users (existing)                             │
├──────────────────────────────────────────────┤
│ id            uuid PK                        │
│ ...           (unchanged)                    │
│ plan          plan    NOT NULL DEFAULT free  │ ◄ NEW
│ plan_version  integer NOT NULL DEFAULT 1     │ ◄ NEW
└──────────────────────────────────────────────┘
   │1                     │1                    │1
   │ creator_id           │ uploaded_by_user_id │ user_id
   │N                     │N                    │N
┌──▼─────────┐     ┌──────▼──────┐       ┌──────▼─────┐
│ courses    │     │ documents   │       │ api_tokens │
│ status     │     │ size_bytes  │       │ (MCP)      │
│ visibility │     │ status      │       └────────────┘
│ ai_access… │     └─────────────┘
└──┬─────────┘
   │1 (course_id, or via topics / lessons)
   │N
┌──▼──────────────┐
│ videos          │
│ duration_seconds│
└─────────────────┘
```

Usage is **counted from existing tables**, with no counter columns to keep in sync:

| Limit                  | Counted as                                                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `publishedCourses`     | `count(courses) where creator_id = user and status = 'published'`                                                             |
| `videoMinutes`         | `sum(videos.duration_seconds) / 60` for videos whose course (directly, or through the topic / lesson) has `creator_id = user` |
| `documentStorageMb`    | `sum(documents.size_bytes) / 1024²` where `uploaded_by_user_id = user` and `status <> 'failed'`, **plus the new file's size** |
| `aiQuizGenerationsDay` | in-memory `consumeAiUsage` counter (today, UTC)                                                                               |

Schema changes in `packages/db-schema/src/schemas/`:

- `enums.ts`: `planEnum = pgEnum("plan", ["free", "pro", "enterprise"])`
- `users.ts`: `plan: planEnum("plan").notNull().default("free")`, `planVersion: integer("plan_version").notNull().default(1)`

Migration: **user runs** `pnpm db:generate --name plans`. Existing users get `free` / `1` from the defaults.

## Where each check goes

```
request ─► handleAuth ─► controller ─► service ──► usersRepository.getUserByAuthUserId
                                         │                 (UserEntity incl. plan)
                                         ▼
                              entitlementsService.get(user)
                                         │
                     ┌───────────────────┴───────────────────┐
                     ▼                                       ▼
          assertFeature(user, key)            assertWithinLimit(user, key, used, adding)
          403 FEATURE_NOT_IN_PLAN             403 LIMIT_REACHED
```

| Feature                          | Service · method                                                                                                  | Trigger                                                        |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `publishedCourses`               | `coursesService.createCourse`, `updateCourse`                                                                     | status becomes `published` (not on edits of already published) |
| `privateCourses`                 | `coursesService.createCourse`, `updateCourse`; `invitationsService.createEmailInvitation`, `createLinkInvitation` | visibility becomes `private`; any new invitation               |
| `studentAiAccess`                | `coursesService.createCourse`, `updateCourse`                                                                     | `aiAccessEnabled` becomes `true`                               |
| `videoMinutes`                   | `videosService.initializeUpload` (gets `authUserId`, like documents already does)                                 | used ≥ limit                                                   |
| `documentStorageMb`              | `documentsService.initializeUpload`                                                                               | used + `dto.size` > limit                                      |
| `aiQuizGenerationsDay`           | `quizzesService.generateQuiz`                                                                                     | `0` → feature error; else `consumeAiUsage(userId, limit)`      |
| `reviewReplies`                  | `reviewsService.saveReply`                                                                                        | always                                                         |
| `mcpAccess`                      | `apiTokensService.createToken` (covers OAuth), `apiTokensService.authenticate`                                    | create, and every MCP request                                  |
| `fullStudentsPage`               | `enrollmentsService.getAllStudents` (`GET /v1/enrollments/students`)                                              | always; `GET /v1/enrollments/stats` stays open (basic counts)  |
| `liveSupport`, `featureRequests` | none                                                                                                              | display only                                                   |

"Becomes" means the check runs only when the value changes. Saving an already private or already published course never fails, so a downgraded creator can still edit what they have.

## Contracts And API

`packages/contract/src/plans/`:

- `errors.ts`: `ErrorCodePlans { FEATURE_NOT_IN_PLAN, LIMIT_REACHED }`; export from `index.ts`.
- `schemas.ts`: `UpdateUserPlanBodySchema = z.object({ plan: PlanSchema, planVersion: z.number().int().positive().optional() })` (defaults to `CURRENT_PLAN_VERSION`). Validate that the version exists in `PLAN_ENTITLEMENTS[plan]`.

`packages/contract/src/users/`: `UserSchema` gains `plan` and `planVersion` (drizzle-zod picks them up from the table).

`packages/shared/src/consts/plansErrorMessages.ts` + `errors.plans.*` in `en` / `sr`:

- `FEATURE_NOT_IN_PLAN`: "Upgrade to Pro" / "This is part of the Pro plan."
- `LIMIT_REACHED`: "Plan limit reached" / "You've used everything your plan includes. Upgrade to Pro for more."

`apps/api/src/modules/plans/`:

- `services/entitlementsService.ts`: `get(user)`, `assertFeature(user, key)`, `assertWithinLimit(user, key, used, adding = 0)`. Pure, no DB; usage is passed in by the caller.
- `repository/plansRepository.ts` (explicit return types): `countPublishedCourses(userId): Promise<number>`, `sumVideoSeconds(userId): Promise<number>`, `sumDocumentBytes(userId): Promise<number>`.
- `controllers` / `routes` / `openapi`: `PUT /v1/users/:id/plan` (admin). Mount under the existing users routes with `validateRole("admin")`, and register it in the users OpenAPI file.

Then `pnpm api-client:generate`.

## Web (minimal)

- **Error toasts:** blocked actions already go through `useErrorHandling*`, so adding the `plansErrorMessages` map to `allErrorMessages.ts` shows the right toast with no other change.
- **Toast action:** an **Upgrade** button on these two error toasts linking to `/pricing`.
- **Pricing page:** the logged-in **Current plan** check uses `useGetUserSelf().data.plan` instead of "has a token", and the matching card gets the badge.
- **Hide or disable** gated controls with `PLAN_ENTITLEMENTS[user.plan][user.planVersion]`: the private visibility option, the AI access switch, the reply button, the AI Create quiz button, and the token creation on AI Connect. Each is disabled with an "Upgrade to Pro" tooltip, so nothing is hidden silently.

## Plan

- [x] 1. Spec (this file) + `spec/task-init.md` row
- [x] 2. DB schema: `planEnum`, `users.plan`, `users.plan_version`
- [~] 3. User runs `pnpm db:generate --name plans` and applies it
- [x] 4. Contract: `ErrorCodePlans`, `UpdateUserPlanBodySchema`, `plan` / `planVersion` on `UserSchema` (kept out of the user create/update bodies)
- [x] 5. Error messages + `errors.plans.*` in `en` / `sr`, added to `allErrorMessages.ts`
- [x] 6. API `plans/` module: `entitlementsService`, `plansRepository` (usage queries); admin `PUT /v1/users/:id/plan` + OpenAPI
- [x] 7. API checks: courses (publish, private, AI access), invitations, videos, documents, quizzes, reviews, API tokens (create + authenticate), students list
- [x] 8. `pnpm api-client:generate`
- [x] 9. Web: pricing **Current plan** from the real plan; gated controls disabled with a **Pro** badge; upgrade notice on AI Connect and Students
- [x] 10. Verify: `pnpm typecheck`, `pnpm lint`, `pnpm turbo build --filter=api... --filter=web...`; update FEATURES.md, the task index, and task 14
- [ ] 11. Manual check after the migration: Free user hits each limit (4th publish, private switch, 31st video minute, 501 MB, AI quiz, reply, token); admin sets Pro → all pass; back to Free → existing content still editable, MCP token rejected with 403

## Implementation notes

- **Admin endpoint lives in the users module** (`usersRoutes` → `usersController.updateUserPlan` → `usersService` → `usersRepository.updateUserPlan`), not in `plans/`; `plans/` holds only `entitlementsService` and `plansRepository`.
- **`plan` / `planVersion` are omitted from `UserPostQuerySchema` / `UserPutQuerySchema`.** `PUT /v1/users/:id` has no admin check (the profile edit uses it), so without the omit a user could upgrade themselves.
- **`getPlanEntitlements(plan, version)`** in `@repo/contract` is the one lookup; `entitlementsService.get` and the web `usePlan()` hook both call it.
- **`assertWithinLimit(user, feature, used, adding)`** throws when `used + adding > limit`. Publishing passes `(count, 1)`, documents `(MB used, new file MB)`, videos `(minutes used, 1)` (a new video needs at least a minute of room).
- **Documents count only `ready` files**, so abandoned pending uploads can't block a user forever (`// ponytail:` simultaneous uploads can overshoot a little).
- **AI quizzes:** `0` → `FEATURE_NOT_IN_PLAN`; otherwise the existing in-memory `consumeAiUsage` with the plan's daily limit, which keeps its `ErrorCodeAi.LIMIT_REACHED` (429).
- **MCP after a downgrade:** `authenticate` reads the plan from the token query it already runs (joined `users`), and throws 403 `FEATURE_NOT_IN_PLAN` rather than returning a 401, so OAuth clients don't loop into a login that can't issue a token.
- **No Upgrade button on error toasts.** About 40 call sites build their own toast, so a central toast action would touch all of them. Controls are disabled up front instead (`ProBadge`), AI Connect and Students show `UpgradeNotice` (link to `/pricing`), and the toast text itself says "Upgrade to Pro". The limits that can't be known up front (publish count, video, documents) still surface as that toast.
- **Web gating treats "plan still loading" as allowed**; the API enforces either way. The Students list only queries once the plan is known, so Free users never see a 403 toast there.

## Resolved Questions (defaults taken)

- **Free and the students list:** today every creator sees the full students list. Gating `GET /v1/enrollments/students` removes it from Free users who have it now. Gate it, or keep it free and drop `fullStudentsPage`? (Default: gate it, as the go-live plan says.)
- **Existing creators over the Free limits on launch day** (e.g. 5 published courses): they keep them, and only the 6th publish is blocked. Or should early users start on Pro for a while? (Default: keep them, block new.)
- **Private courses after a downgrade:** they stay private and existing invitations keep working; only new invitations are blocked. OK? (Default: yes.)
