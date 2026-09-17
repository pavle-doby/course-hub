---
name: blazing
description: >
  Activates the Blazing (blp) agent stack: CodeGraph for codebase exploration
  and Ponytail for simplicity enforcement.
  Use when the user says "blazing", "blp", "use blp", "full stack mode", or
  "activate blazing". All tools stay active for the entire session.
---

# Blazing

- Always start with `AGENTS.md`
- Activate all tools simultaneously and keep them active for every response.
- Create new OpenCode configuration as `opencode.jsonc`, never `opencode.json`.
- When working in `apps/web/`, use the shadcn MCP for component or design-system context when needed.

## Active stack

**CodeGraph** — codebase exploration. Use `codegraph_context` first, then narrow with search/callers/callees/impact/node/explore/files as needed.

**Ponytail** — simplicity enforcement. Full intensity by default. YAGNI. Stdlib before custom. Native before deps. One line before fifty. No speculative abstractions.

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
