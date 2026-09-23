---
name: blazing
description: >
  Activates the Blazing (blp) agent stack: CodeGraph for codebase exploration
  and Ponytail for simplicity enforcement.
  Use when the user says "blazing", "blp", "use blp", "full stack mode", or
  "activate blazing". All tools stay active for the entire session.
---

<!-- Claude Code port of .opencode/skills/blazing/SKILL.md — keep the two in sync. -->

# Blazing

- Always start with `AGENTS.md` (loaded via `CLAUDE.md`; nested `AGENTS.md` files apply to their subtrees).
- Activate all tools simultaneously and keep them active for every response.
- Create new OpenCode configuration as `opencode.jsonc`, never `opencode.json`.
- When working in `apps/web/`, use the shadcn MCP for component or design-system context when needed.

## Active stack

**CodeGraph** — codebase exploration. Use the `codegraph_explore` MCP tool (or `codegraph explore "<query>"` in the shell) before grep/find or reading files.

**Ponytail** — simplicity enforcement (the `ponytail@ponytail` Claude Code plugin). Full intensity by default. YAGNI. Stdlib before custom. Native before deps. One line before fifty. No speculative abstractions.

### Ponytail skills — invoke by name when needed

| Skill              | When                                                         |
| ------------------ | ------------------------------------------------------------ |
| `/ponytail-review` | After writing code — hunt over-engineering, find what to cut |
| `/ponytail-audit`  | Whole-repo scan — ranked bloat list                          |
| `/ponytail-debt`   | Harvest `ponytail:` comments into debt ledger                |
| `/ponytail-gain`   | Show ponytail impact scoreboard                              |
| `/ponytail-help`   | Quick-reference for all ponytail commands                    |

## Output attribution

Append only what you actually used:

- `codegraph_*` used → **CodeGraph 🐙**
- Ponytail active → **Ponytail 🐴**
- Blazing active → **Blazing 🔥**
