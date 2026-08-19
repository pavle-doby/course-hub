---
name: blazing
description: >
  Activates the full Blazing (blp) agent stack: CodeGraph for codebase exploration,
  Context7 for documentation, Caveman for token compression, and Ponytail for simplicity
  enforcement — all at once. Use when the user says "blazing", "blp", "use blp",
  "full stack mode", or "activate blazing". All four tools stay active for the entire session.
---

# Blazing

Activate all four tools simultaneously and keep them active for every response.

## Active stack

**CodeGraph** — codebase exploration. Use `codegraph_context` first, then narrow with search/callers/callees/impact/node/explore/files as needed.

**Context7** — docs & code gen. Resolve library ID first, then fetch docs. Use for any library, framework, or API question.

**Caveman** — token compression. Full intensity by default. Drop filler, hedging, pleasantries. Fragments OK. Technical terms exact. Code blocks unchanged. Revert to clear prose only for security warnings or irreversible actions.

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
- `context7_*` used → **Context7 🕸️**
- Caveman active → **Caveman 🪨**
- Ponytail active → **Ponytail 🐴**
- Blazing active → **Blazing 🔥**
