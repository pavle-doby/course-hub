# Task 14: Pricing Page (Cenovnik)

Scope: **web only**, and the page only describes plans. Nothing is enforced yet. This task is **Phase 1** of the plan below; Phases 2–3 are later tasks. Add a public `/pricing` page with three plan cards (**Free**, **Pro**, **Enterprise**), linked from the navigation right below **AI Connect**. Plans, prices and features come from [go-live-plan.md](../go-live-plan.md). This spec also sets the feature-flag (entitlement) model and its DB shape, so enforcement can follow later as its own task, using the same keys and numbers the page shows.

Status legend: `[x]` done · `[ ]` todo · `[~]` needs the user (e.g. DB commands).

## Decisions

- **Public page, no API calls.** `/pricing` uses the same `NavigationLayoutProvider` shell as the public home page (`app/page.tsx`). The web client sets no `onUnauthorized` handler, so a logged-out visitor sees the nav and the page. The nav's unread-notifications poll gets a 401 and fails quietly, which already happens on the home page. The page itself calls no endpoint.
- **Plan data lives in `@repo/contract`, not the DB.** `PLAN_ENTITLEMENTS` (feature → on/off or limit, per plan **and version**) is a constant in `packages/contract/src/plans/`. The page renders it now; the API will enforce the same constant later. One place to change a limit, and the page can't drift from what's enforced. It is versioned from day one (`PLAN_ENTITLEMENTS[plan][version]`, `CURRENT_PLAN_VERSION = 1`): changing a plan's limits adds a version, so existing users can keep theirs (grandfathering) without copying rows per user.
- **Prices are display constants, not entitlements.** `PLAN_PRICES` sits next to the entitlements: Free €0, Pro €19 / month or €190 / year. Enterprise has no price. Once payments exist, the payment provider is the source of truth for what a customer pays, and these constants only drive the page.
- **Monthly / yearly toggle.** An outlined `ButtonGroup` above the cards (`billing-toggle.tsx`, same pattern as the theme picker in Settings: active button `default`, the other `outline`, `aria-pressed`), **Yearly** first and selected by default; clicking it sets off one firework burst centered on the button (`fireworkBurstFrom` in `apps/web/utils/celebrate.ts`, the same burst as the course-completed dialog), and a small thank-you note shows under the toggle while yearly is selected; it carries a "2 months free" badge. Free and Pro show the price for the chosen period (€0 / €19 per month, €0 / €190 per year); Enterprise shows "Contact sales" either way. In yearly mode, "You get 2 months free" shows under the Pro price; monthly shows no note. It appears only when the yearly price is below 12 × monthly, so Free gets none. The A/B test on which period shows first comes with PostHog.
- **Card buttons (nothing to buy yet):**
  - Free: logged out → **Get started** (`/auth/signup`); logged in → **Current plan**, disabled. Everyone is on Free today, so checking for an access token (`getAccessToken()`, as the invite page does) is enough.
  - Pro: **Coming soon**, disabled, until payments are resolved (go-live step 2).
  - Enterprise: **Contact us** → `mailto:${NEXT_PUBLIC_CONTACT_EMAIL}?subject=Course Hub Enterprise`. New env var in `apps/web/.env.example`. If it isn't set, the button shows disabled.
- **Enterprise replaces the "Team / School" idea** from the go-live plan for now. It has everything in Pro, no default caps, live support and feature requests. Update `go-live-plan.md` when this ships.
- **Nav placement:** desktop `FOOTER_ITEMS` becomes AI Connect → **Pricing** → Settings → Log Out. The mobile header sheet gets the same order, and `TITLE_BY_PATH` gets `/pricing`. The mobile bottom nav doesn't change.

## Feature flags (entitlements)

There are two kinds of "flags". Keep them apart:

| Kind                          | Question it answers                             | Where it lives                                                     | When                           |
| ----------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ | ------------------------------ |
| **Entitlement** (plan gate)   | "Is this user _allowed_ X / how much of X?"     | `PLAN_ENTITLEMENTS` in code + `users.plan` + overrides table in DB | Keys now (this task), DB later |
| **Rollout / experiment flag** | "Should this user _see_ the new X / variant B?" | PostHog feature flags (go-live step 4), not our DB                 | With analytics, separate task  |

### Feature keys

`PlanFeature` (Zod enum in `packages/contract/src/plans/schemas.ts`). Limits are numbers, and `null` means unlimited.

| Key                    | Kind    | Free | Pro           | Enterprise | Enforced later in                                    |
| ---------------------- | ------- | ---- | ------------- | ---------- | ---------------------------------------------------- |
| `publishedCourses`     | limit   | 3    | `null`        | `null`     | `coursesService` publish                             |
| `videoMinutes`         | limit   | 30   | 1200 (20 h)   | `null`     | `videosService` upload start (sum of stored minutes) |
| `documentStorageMb`    | limit   | 500  | 20480 (20 GB) | `null`     | `documentsService` upload start                      |
| `aiQuizGenerationsDay` | limit   | 0    | 20            | `null`     | `quizzesService.generate` (today's in-memory count)  |
| `privateCourses`       | boolean | ✗    | ✓             | ✓          | course visibility update + invitations               |
| `mcpAccess`            | boolean | ✗    | ✓             | ✓          | `handleTokenAuth` + token create/OAuth issue         |
| `studentAiAccess`      | boolean | ✗    | ✓             | ✓          | `aiAccessEnabled` switch                             |
| `reviewReplies`        | boolean | ✗    | ✓             | ✓          | reviews reply endpoint                               |
| `fullStudentsPage`     | boolean | ✗    | ✓             | ✓          | students detail endpoints                            |
| `liveSupport`          | boolean | ✗    | ✗             | ✓          | display only (support channel)                       |
| `featureRequests`      | boolean | ✗    | ✗             | ✓          | display only (request channel)                       |

Free features that every plan has (drafts, topics/lessons, manual quizzes, leaderboard, push notifications, the whole learner side) get **no key**. Nothing gates them, so a flag would be dead weight.

`// ponytail:` `aiQuizGenerationsDay: null` for Enterprise means no cap. If a deal needs one, set it with an override row (below), not a new plan.

### Phases

| Phase                                                   | What                                                                                                                                                                                                        |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Pricing page** (this task)                         | `/pricing`, nav link, `PLAN_ENTITLEMENTS` / `PLAN_PRICES` in the contract. No DB.                                                                                                                           |
| **2. Enforcement** (done, [task 15]([done]-task-15.md)) | `plan` enum + `users.plan` + `users.plan_version`; `entitlementsService`; limit checks; `ErrorCodePlans`; plan on `GET /v1/users/self`; disabled controls with a Pro badge. Plans set by an admin endpoint. |
| **3. Payments**                                         | `subscriptions` table, hosted checkout + webhook that keeps `users.plan` in sync; Pro button becomes **Upgrade**.                                                                                           |

### DB shape (Phase 2)

```ts
// enums.ts
export const planEnum = pgEnum("plan", ["free", "pro", "enterprise"]);

// users.ts — new columns
plan: planEnum("plan").notNull().default("free"),
planVersion: integer("plan_version").notNull().default(1),
```

User runs `pnpm db:generate --name plans`.

- **Effective entitlement** = `PLAN_ENTITLEMENTS[user.plan][user.planVersion][feature]`, resolved in `apps/api/src/modules/plans/services/entitlementsService.ts` (`getEntitlements(user)`, `assertFeature(user, key)`, `assertWithinLimit(user, key, used)`). New error enum `ErrorCodePlans`: `FEATURE_NOT_IN_PLAN` (403), `LIMIT_REACHED` (403). The web shows an upgrade prompt for both.
- **Why columns on `users`:** `handleAuth` already loads the user on every request, so the plan costs no extra query.
- **What a plan includes is code, not DB:** a feature only does something where the code checks it, so its per-plan values live next to that code and the type checker (`satisfies`) forces every plan and version to set every key.

Phase 3 adds `subscriptions` (`user_id` FK, `provider`, `external_id`, `status`, `plan`, `current_period_end`, timestamps); `users 1 ── 0..N subscriptions`.

### Added only when a real need appears

| Trigger                                           | Addition                                                                                                                                                                                                               |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First Enterprise deal, comp, trial or abuse block | `user_entitlement_overrides` (`user_id`, `feature` text checked by `PlanFeatureSchema`, `enabled`, `limit_value` null = unlimited, `note`, `expires_at`; unique `(user_id, feature)`). Checked first, before the plan. |
| A plan's limits change                            | New version in `PLAN_ENTITLEMENTS`; new users get it, existing users keep theirs                                                                                                                                       |
| Sales/support must edit plans without a deploy    | `plans(name, version, entitlements jsonb)` table, still no per-user copies                                                                                                                                             |
| A/B testing (go-live step 4)                      | PostHog feature flags, separate from entitlements                                                                                                                                                                      |

**Rejected:** a per-user `user_entitlements` copy table (every row materialized, `is_overridden` flag) plus a versioned `user_plans` table. Every upgrade, new feature or plan edit would need a sync or backfill for all users, and its main benefit (versioning) comes from `plan_version` without the copies.

## Supported Flows

| Trigger                                      | Effect                                                                  |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| Anyone clicks **Pricing** in the nav         | Opens `/pricing`; works logged out                                      |
| Visitor opens `/pricing` directly (no token) | Page renders, no redirect to login                                      |
| Logged-out visitor clicks **Get started**    | `/auth/signup`                                                          |
| Logged-in user sees the Free card            | Button reads **Current plan**, disabled                                 |
| Anyone looks at the Pro card                 | **Coming soon**, disabled                                               |
| Anyone clicks **Contact us** (Enterprise)    | Opens the mail client to `NEXT_PUBLIC_CONTACT_EMAIL`, subject prefilled |

## Contract

`packages/contract/src/plans/` (`schemas.ts`, `types.ts`, `entitlements.ts`, `index.ts`; re-exported from `src/index.ts`):

- `BillingPeriod = "monthly" | "yearly"`.
- `PlanSchema = z.enum(["free", "pro", "enterprise"])`, `PlanFeatureSchema` (keys above).
- `PLAN_ENTITLEMENTS[plan][version]` (`satisfies Record<Plan, Record<number, PlanEntitlements>>`) and `CURRENT_PLAN_VERSION`.
- `PLAN_PRICES: { free: { monthly: 0, yearly: 0 }, pro: { monthly: 1900, yearly: 19000 }, enterprise: null }`, in EUR cents like `courses.price`.

No API, OpenAPI or `api-client:generate` changes in this task.

## Web

- `apps/web/app/pricing/layout.tsx`: `NavigationLayoutProvider`, same as `ai-connect/layout.tsx`.
- `apps/web/app/pricing/page.tsx` (client): heading + subtitle ("Learning is always free. Creators pick a plan."), then `grid gap-6 md:grid-cols-3` with the three cards. `max-w-5xl` centered, page padding like other pages.
- `apps/web/app/pricing/components/plan-card.tsx`: `Card` with plan name, price block (or a short tagline for Enterprise), a feature list (`CheckIcon` + text), and the CTA at the bottom (`mt-auto`). Pro gets `border-primary` and a **Most popular** `Badge`.
- `apps/web/app/pricing/components/plan-features.ts`: per plan, the ordered list of lines `{ key: PricingFeatureKey, count?: number }`. Numbers come from `PLAN_ENTITLEMENTS`, so the copy can't drift from the limits:
  - **Free:** up to {{count}} published courses, unlimited drafts · {{count}} min of video · {{count}} MB of documents · manual quizzes · public courses with open enrollment · leaderboard on every course · students page with basic counts · push notifications · everything for learners is free.
  - **Pro:** everything in Free, plus · unlimited courses · {{count}} hours of video · {{count}} GB of documents · AI quiz generation ({{count}} per day) · private courses and invitations · AI Connect (MCP) and access tokens · AI access for students · replies to reviews · full students page.
  - **Enterprise:** everything in Pro, plus · no limits on video, documents or AI · live support · request new features.
- `components/side-nav-menu.tsx`: `"nav.pricing"` in `NavKey`, `{ label: "nav.pricing", icon: TagIcon, href: "/pricing" }` after AI Connect in `FOOTER_ITEMS`.
- `components/mobile-header.tsx`: Pricing link after AI Connect in the sheet; `"/pricing": "nav.pricing"` in `TITLE_BY_PATH`.
- `apps/web/.env.example`: `NEXT_PUBLIC_CONTACT_EMAIL=`.

## i18n

`packages/i18n/src/locales/{en,sr}/`: `nav.pricing` ("Pricing" / "Cenovnik") and a new `pricing.ts` registered in each `index.ts`:

- `title`, `subtitle`, `mostPopular`, `perMonth`, `perYear`, `billingPeriod`, `monthly`, `yearly`, `yearlySaving`, `savingNoteYearly`, `yearlyThanks`, `contactSales`, `getStarted`, `currentPlan`, `comingSoon`, `contactUs`
- `plans.{free,pro,enterprise}.{name,tagline}` (Free / Besplatno, Pro, Enterprise)
- `features.*`, one key per line above, `{{count}}` where needed

## Plan

- [x] 1. Spec (this file) + `spec/task-init.md` row
- [x] 2. Contract: `plans/` with `PlanSchema`, `PlanFeatureSchema`, `PLAN_ENTITLEMENTS`, `CURRENT_PLAN_VERSION`, `PLAN_PRICES`
- [x] 3. Web: `/pricing` layout, page, `plan-card`, `plan-price`, `plan-action`, `plan-features`
- [x] 4. Web: Pricing in the desktop footer nav and mobile header sheet (below AI Connect), `TITLE_BY_PATH`
- [x] 5. `NEXT_PUBLIC_CONTACT_EMAIL` in `apps/web/.env.example`
- [x] 6. i18n `en` / `sr`: `nav.pricing`, `pricing.*`
- [x] 7. Verify: `pnpm typecheck`, `pnpm lint`, `pnpm turbo build --filter=web... --filter=api...`; update FEATURES.md, the task index and `go-live-plan.md` (Enterprise)
- [ ] 8. Manual check: open `/pricing` logged out (no redirect, no visible error) and logged in (Current plan), Contact us opens mail, both languages, mobile width

## Implementation notes

- Enterprise shows "Contact sales" where the price would be (`plan-price.tsx`) and **Contact us** as its bottom button (`plan-action.tsx`), aligned with the other cards.
- Prices show without decimals: `formatPrice` gained an optional `Intl.NumberFormatOptions` argument.
- Logged-in detection uses `useSyncExternalStore` over `getAccessToken()`, so the server render (no `localStorage`) and the first client render agree, avoiding a hydration mismatch.
- Translations use `{{value}}` (not `{{count}}`) so i18next doesn't look for plural keys.

## Open Questions

- Which address is `NEXT_PUBLIC_CONTACT_EMAIL`? Or should **Contact us** open a form instead of `mailto:`? (Default: `mailto:`.)
- Enterprise: show a "custom limits" line, or keep it at "no limits"? (Default: "no limits on video, documents or AI".)
- Should the Pro button send people to a waitlist instead of a disabled **Coming soon**? (Default: disabled.)
