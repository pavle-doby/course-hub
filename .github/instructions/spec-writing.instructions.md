---
description: "Use when writing, reviewing, or updating specification files in the spec/ folder. Covers feature specs (overview and user stories only), architecture decisions, and data model documentation for the Course Hub project. For technical detail (Acceptance Criteria, API Contract, Data Model) use tech-spec-writing.instructions.md."
applyTo: "spec/**"
---

# Specification Writing Guidelines

## Overview

Specifications live in the `spec/` directory and are written in Markdown. They serve as the source of truth for requirements and are directly traceable to implementation in this monorepo.

## Folder Structure

```
spec/
├── README.md                  # Index of all specs with their status
├── features/                  # One folder per product feature
│   └── <feature-name>/        # Folder named after the feature (e.g. course/)
│       └── <feature-name>-<spec-name>.md   # Files prefixed with the feature name
├── architecture/
│   ├── decisions/             # Architecture Decision Records (ADRs)
│   │   └── NNN-title.md       # e.g. 001-monorepo-structure.md
│   └── data-model.md          # Entity relationships and DB schema overview
└── non-functional.md          # Performance, security, and accessibility requirements
```

### Feature Folder Convention

Each feature gets its own sub-folder inside `spec/features/`. All spec files for that feature live in that folder and are prefixed with the feature name followed by a hyphen.

**Example — `course` feature:**
```
spec/features/course/
├── course-create.md
└── course-follow.md
```

This keeps related specs grouped and makes the feature scope immediately clear from the file path.

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

Use this template for every file in `spec/features/`. Spec files contain only the **Overview** and **User Stories** — technical detail lives in the corresponding tech spec (see `tech-spec-writing.instructions.md`).

```markdown
# Feature: <Name>

**Status:** Draft | Review | Approved | Done | Deprecated

## Overview

One paragraph describing what this feature does and why it exists.

## User Stories

- As a **[role]**, I can [action] so that [benefit].
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

## Writing Style

- Use **role-based user stories**: creator, student, admin
- Keep each spec focused on **one feature** — split into multiple files if scope grows
- Keep specs up to date as the implementation evolves — mark as `Done` when shipped

## Updating the spec/README.md Index

Every time a new spec file is added or its status changes, update `spec/README.md` to reflect the current state. The index should list all specs with their status and a one-line description.
