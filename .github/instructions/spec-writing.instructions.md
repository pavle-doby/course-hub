---
description: "Use when writing, reviewing, or updating specification files in the spec/ folder. Covers feature specs, architecture decisions, and data model documentation for the Course Hub project."
applyTo: "spec/**"
---

# Specification Writing Guidelines

## Overview

Specifications live in the `spec/` directory and are written in Markdown. They serve as the source of truth for requirements and are directly traceable to implementation in this monorepo.

## Folder Structure

```
spec/
├── README.md                  # Index of all specs with their status
├── features/                  # One file per product feature
│   └── <feature-name>.md
├── architecture/
│   ├── decisions/             # Architecture Decision Records (ADRs)
│   │   └── NNN-title.md       # e.g. 001-monorepo-structure.md
│   └── data-model.md          # Entity relationships and DB schema overview
└── non-functional.md          # Performance, security, and accessibility requirements
```

## Status Values

Every spec file must include a status in its frontmatter or heading:

| Status    | Meaning                                          |
|-----------|--------------------------------------------------|
| `Draft`   | Work in progress, not ready for review           |
| `Review`  | Ready for stakeholder review                     |
| `Approved`| Agreed on and ready to be implemented            |
| `Done`    | Fully implemented                                |
| `Deprecated` | No longer relevant                            |

## Feature Spec Template

Use this template for every file in `spec/features/`:

```markdown
# Feature: <Name>

**Status:** Draft | Review | Approved | Done | Deprecated

## Overview

One paragraph describing what this feature does and why it exists.

## User Stories

- As a **[role]**, I can [action] so that [benefit].

## Acceptance Criteria

- [ ] Criterion one
- [ ] Criterion two

## API Contract

Reference the relevant endpoints from `apps/api/openapi.json` or types in `packages/contract/src/`.

Example:
- `POST /auth/sign-up` — defined in `packages/contract/src/auth/`
- Response types: `SignUpResponse` from `packages/contract/src/auth/index.ts`

## Data Model

Reference the relevant tables/entities from `packages/db-schema/src/`.

Example:
- `users` table — `packages/db-schema/src/users.ts`

## Out of Scope

List things this spec explicitly does not cover, to prevent scope creep.
```

## Architecture Decision Records (ADRs)

Use this template for files in `spec/architecture/decisions/`:

```markdown
# NNN: <Short Title>

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded by [NNN](./NNN-title.md)

## Context

What is the problem or situation driving this decision?

## Decision

What was decided?

## Consequences

What are the trade-offs, risks, or impacts of this decision?
```

## Traceability Rules

When writing specs, link requirements directly to implementation:

- **API endpoints** → reference `apps/api/openapi.json` paths or `packages/contract/src/` types
- **Database entities** → reference `packages/db-schema/src/` files
- **UI components** → reference `packages/ui/src/` or `packages/app/features/`
- **Business logic** → reference `apps/api/src/services/` or `apps/api/src/modules/`

## Writing Style

- Write acceptance criteria as **testable, observable behaviors** — avoid vague language like "should work well"
- Use **role-based user stories**: creator, student, admin
- Keep each spec focused on **one feature** — split into multiple files if scope grows
- Avoid duplicating code from the implementation; reference paths instead
- Keep specs up to date as the implementation evolves — mark as `Done` when shipped

## Updating the spec/README.md Index

Every time a new spec file is added or its status changes, update `spec/README.md` to reflect the current state. The index should list all specs with their status and a one-line description.
