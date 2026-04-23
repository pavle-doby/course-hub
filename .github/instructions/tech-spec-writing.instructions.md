---
description: "Use when writing, reviewing, or updating technical detail for feature specs. Covers Acceptance Criteria, API Contract, and Data Model sections. Complements spec-writing.instructions.md which owns the Overview and User Stories."
applyTo: "spec/**"
---

# Technical Specification Writing Guidelines

## Overview

Technical specs live alongside feature specs in `spec/features/` and capture the implementation-level detail that is too granular for a product spec. Each tech spec maps 1-to-1 with a feature spec file and must reference real code paths in the monorepo.

## Tech Spec Template

Append the following sections to the corresponding `spec/features/<feature-name>.md` file, below the **User Stories** section.

```markdown
## Acceptance Criteria

- [ ] <Testable, observable behavior — one criterion per line>

## API Contract

- `<METHOD> <path>` — defined in [<file>](<relative-path>)
- Request body validated by `<SchemaName>` — [<file>](<relative-path>)
- Request type: `<TypeName>` — [<file>](<relative-path>)
- Response type: `<TypeName>` — [<file>](<relative-path>)
- Error codes: `ErrorCode.<VALUE>` — [<file>](<relative-path>)

## Data Model

- `<table>` table — [<file>](<relative-path>)
  - `<column>` (<type>) — <description>

## Out of Scope

- <Thing this spec explicitly does not cover>
```

## Section Rules

### Acceptance Criteria

- Write criteria as **testable, observable behaviors** — avoid vague language like "should work well".
- Each criterion must be independently verifiable (unit test, integration test, or manual check).
- Cover: happy path, validation errors, business-rule errors, edge cases.
- Use HTTP status codes and error code constants (from `packages/contract/src/`) in criteria.

### API Contract

- Reference the route file in `apps/api/src/modules/<feature>/routes/`.
- Reference Zod schemas from `packages/contract/src/<feature>/schemas.ts`.
- Reference request/response types from `packages/contract/src/<feature>/types.ts`.
- Reference error code enums from `packages/contract/src/<feature>/errors.ts`.
- Use relative Markdown links from the spec file location (e.g. `../../apps/api/...`).

### Data Model

- Reference table definitions from `packages/db-schema/src/schemas/`.
- List only the columns that are **directly relevant** to the feature.
- Include column name, type, and a short description of its role in the feature.
- Do not duplicate the full schema — link to it and describe the relevant fields only.

### Out of Scope

- Explicitly list things this spec does not cover to prevent scope creep.
- Items here are candidates for future spec files (reference version labels like "v2" when helpful).

## Traceability Rules

Link all technical sections to the real implementation files:

- **API endpoints** → `apps/api/src/modules/<feature>/routes/`
- **Validation schemas** → `packages/contract/src/<feature>/schemas.ts`
- **Request/Response types** → `packages/contract/src/<feature>/types.ts`
- **Error codes** → `packages/contract/src/<feature>/errors.ts`
- **Database tables** → `packages/db-schema/src/schemas/<table>.ts`
- **Business logic** → `apps/api/src/modules/<feature>/services/`

## Writing Style

- Write acceptance criteria in the **present tense**: "The API returns…", "The form collects…"
- Use concrete values: HTTP status codes, field names, error code constants — not descriptions.
- Avoid duplicating code; reference paths instead.
- Keep tech specs up to date as contracts and schemas change.
