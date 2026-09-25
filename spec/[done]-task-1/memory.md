# Task 1 — Memory / working notes

Development paused here at user's request. Resume by reading `plan.md` (checklist) and
`context.md` (design decisions/rationale) in this folder first.

## State of the repo right now
- Backend Topics module is fully implemented, generated, and error-free (verified via
  `get_errors` on every new/edited backend + contract file).
- `apps/web/app/courses` was moved to `apps/web/app/(courses)/courses` via `git mv`
  (route group restructure). This is a **working tree change, not committed**.
- Nothing under `apps/web/app/courses/add/` exists yet — the actual "Add Course" page
  UI has NOT been built yet. This is the next thing to do when work resumes.
- i18n keys for the editor have NOT been added yet.

## Gotchas hit during this session (useful if repeated)
- `pnpm api-client:generate` (== `turbo run generate:openapi generate:api`) is racy:
  `turbo.json` has no `dependsOn` between the two tasks, so orval can run against a
  stale `openapi.json`. Fix: run sequentially —
  `pnpm --filter api generate:openapi && pnpm --filter @repo/api-client generate:api`.
- `git mv <dir> '(group)/<dir>'` fails with "No such file or directory" if the parent
  group directory doesn't exist yet — `mkdir -p '(group)'` first, then `git mv`.
- No image was actually attached to the original user request despite them saying
  "based on pasted image" — proceeded from the text spec only, flagged nothing since
  the text description was detailed enough to act on.
- Confirmed with the user (via `vscode_askQuestions`) before building a whole new
  backend module (topics) since it was a significant scope/architecture decision not
  explicitly requested — user chose "Build full Topics backend". Worth asking this
  kind of question again if a similar "missing backend for a nested resource" gap is
  found elsewhere in this repo.

## No blockers — just paused
There is no technical blocker; development was stopped purely because the user asked
to stop. Next step when resuming: build `apps/web/app/courses/add/page.tsx` and its
components per the "Remaining" section of `plan.md`.
