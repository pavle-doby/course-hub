# Task 12: Course Price

Scope: a creator sets a price on a course; the price shows on course cards and on the course overview. **Display only.** No payments, no checkout, enrollment stays free and unchanged. A real payment flow (Stripe, enrollment gating) is a separate later task that builds on this column.

Status legend: `[x]` done · `[ ]` todo · `[~]` needs the user (e.g. DB commands).

## Decisions

- **One integer column, `courses.price`, in minor units (cents)**, `notNull().default(0)`. `0` = free. Integers avoid float rounding; existing courses become free with no backfill.
- **One currency for the whole app**, a `COURSE_CURRENCY` constant in `apps/web/utils/consts.ts` (default `"EUR"`, switch to `"RSD"` if preferred). No per-course currency column until payments need it.
- **No new error codes.** `price` is validated by Zod (`int`, `>= 0`, capped at `1_000_000_00`), so bad input returns the existing validation error.
- **Edited from the course actions panel**, next to the AI access switch, mirroring `handleAiAccessChange`: a number input in whole currency units, saved on blur via the existing `PUT /v1/courses/:id`. `EntityForm` stays untouched (it's shared with topics and lessons).
- **Formatting via `Intl.NumberFormat`** (`style: "currency"`), so `en`/`sr` locales format it for free. `0` shows the localized "Free" label.
- **Web only.** The native app gets `price` in its types after regeneration but shows nothing yet.

## Steps

### 1. DB schema

- [x] `packages/db-schema/src/schemas/courses.ts`: `price: integer("price").notNull().default(0)` (price in cents; 0 = free).
- [~] User runs `pnpm db:generate --name course_price` and applies it.

### 2. Contract (`packages/contract/src/courses/schemas.ts`)

- [x] Add `price: true` to the `.pick()` of `CourseSchema`, `CoursePostQuerySchema` and `CoursePutQuerySchema`.
- [x] In the post/put refinements: `price: (s) => s.int().nonnegative().max(1_000_000_00)` (`.optional()` on post).

### 3. API

- [x] `apps/api/src/modules/courses/repository/coursesRepository.ts`: add `price: schema.courses.price` to `courseRowColumns`.
- [x] `apps/api/src/modules/enrollments/repository/enrollmentsRepository.ts`: add `price` to the hand-picked `courseColumns` (so enrolled cards type-check with `CourseStats`).
- Create/update/list/public routes already spread the validated body and select those columns, so no service, controller, route or OpenAPI changes are needed.

### 4. API client

- [x] `pnpm api-client:generate`.

### 5. Web

- [x] `apps/web/utils/consts.ts`: `COURSE_CURRENCY`.
- [x] `apps/web/utils/format-price.ts`: `formatPrice(cents, language)` returning `Intl.NumberFormat(..., { style: "currency", currency: COURSE_CURRENCY }).format(cents / 100)`.
- [x] `course-editor.tsx`: `price` in `CourseDraft` / `toCourseDraft`; `handlePriceChange(price)` copied from `handleAiAccessChange`; pass `price` + `onPriceChange` to `CourseActions`.
- [x] `course-actions.tsx`: `priceAction` section (mobile drawer + desktop sidebar) rendering the new `course-price-input.tsx` (number input in whole units, on blur `onPriceChange(Math.round(value * 100))` if changed; invalid input snaps back).
- [x] `apps/web/components/course-stats.tsx`: add `"price"` to the `Pick`; render a `TagIcon` + `formatPrice(...)` or `t("courses.card.free")`.
- [x] `learn/[publicId]/components/learn-working-area.tsx`: `price` in the `course` prop type; show the same formatted price next to `StarRating` on the overview.
- [x] i18n `en` + `sr` `courses.ts`: `editor.priceLabel`, `editor.priceHint`, `editor.priceChangedToast`, `card.free`.

### 6. Docs + verification

- [x] `FEATURES.md` entry; rename this file to `[done]` and update `spec/task-init.md`.
- [x] `pnpm turbo build --filter=api...`, `pnpm typecheck`, `pnpm lint`, `pnpm turbo build --filter=web...`.
- [ ] Manual: set a price → card + overview show it; set `0` → "Free"; a negative or non-numeric value is rejected; existing courses show "Free".

## Out of scope

Payments and checkout, blocking enrollment on unpaid courses, per-course currency, price filters/sorting in Explore, native UI, MCP course tools exposing price.
