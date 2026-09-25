# Task Index

Every spec in `spec/`, grouped by feature. The file name prefix is the task's state: `[done]` (implemented), `[in-progress]` (partly implemented), `[todo]` (spec only). When a task's state changes, rename the file and update this table and any `spec/...` links (FEATURES.md, other specs).

| Feature                                | Task files                                                                | State | Notes                                                            |
| -------------------------------------- | ------------------------------------------------------------------------- | ----- | ---------------------------------------------------------------- |
| Add Course page (course editor UI)     | [`[done]-task-1/`]([done]-task-1/) (`plan.md`, `context.md`, `memory.md`) | done  | Manual browser check left unchecked                              |
| Edit Course page                       | [`[done]-task-2/`]([done]-task-2/) (`plan.md`, `context.md`)              | done  | Manual browser verification left unchecked                       |
| Videos (Cloudflare Stream)             | [`[done]-task-3/plan.md`]([done]-task-3/plan.md)                          | done  |                                                                  |
| Documents (Cloudflare R2)              | [`[done]-task-4/plan.md`]([done]-task-4/plan.md)                          | done  |                                                                  |
| Course thumbnails                      | [`[done]-task-5.md`]([done]-task-5.md)                                    | done  |                                                                  |
| Push notifications                     | [`[done]-task-6.1.md`]([done]-task-6.1.md)                                | done  |                                                                  |
| Notification history                   | [`[todo]-task-6.2.md`]([todo]-task-6.2.md)                                | todo  | `/notifications` still "Coming soon..."                          |
| Learner progress tracking              | [`[done]-task-7.md`]([done]-task-7.md)                                    | done  |                                                                  |
| AI foundation (shared course tools)    | [`[done]-task-8.0.md`]([done]-task-8.0.md)                                | done  | Manual 403 check pending                                         |
| MCP server for coding agents           | [`[done]-task-8.1.md`]([done]-task-8.1.md)                                | done  | Most manual checks pending                                       |
| AI chat in the course editor           | [`[todo]-task-8.2.md`]([todo]-task-8.2.md)                                | todo  |                                                                  |
| Course reviews                         | [`[done]-task-9.md`]([done]-task-9.md)                                    | done  | User still runs the `course_reviews` migration                   |
| Quizzes (AI and manual)                | [`[done]-task-10.md`]([done]-task-10.md)                                  | done  | User still runs the `rename_questionnaires_to_quizzes` migration |
| Quiz tools for MCP                     | [`[done]-task-10.1.md`]([done]-task-10.1.md)                              | done  | Manual MCP checks pending                                        |
| AI usage tracking + bring-your-own key | [`[todo]-task-10.2.md`]([todo]-task-10.2.md)                              | todo  | Spec written                                                     |

Not a task: [web-audit/findings.md](web-audit/findings.md) is a research-only audit of `apps/web`.
