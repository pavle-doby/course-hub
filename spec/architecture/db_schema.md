# DB Schema Plan — Course Hub

> Supabase (PostgreSQL) + Drizzle ORM

---

## Enums

| Enum | Values |
|------|--------|
| `user_role` | `user`, `admin` |
| `user_status` | `pending`, `approved`, `rejected` |
| `course_status` | `draft`, `published`, `unpublished`, `deleted` |
| `block_type` | `topic`, `lesson` |

---

## Tables

### `users` ✓ existing

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `email` | varchar | unique |
| `image` | varchar | |
| `first_name` | varchar | |
| `last_name` | varchar | |
| `username` | varchar | unique — **add** |
| `bio` | text | **add** |
| `role` | user_role | default `user` |
| `status` | user_status | default `pending` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `last_login` | timestamptz | |

---

### `file_uploads` ✓ existing

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK→users | cascade delete |
| `url` | varchar | |
| `public_url` | varchar | |
| `full_path` | varchar | |
| `bucket` | varchar | |
| `path` | varchar | |
| `file_name` | varchar | |
| `type` | varchar | video / image / pdf |
| `size` | integer | bytes |
| `uploaded_at` | timestamptz | |

---

### `courses`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `creator_id` | uuid FK→users | |
| `name` | varchar | |
| `description` | text | |
| `status` | course_status | default `draft` |
| `created_at` | timestamptz | |
| `published_at` | timestamptz | null until first publish |
| `updated_at` | timestamptz | |

---

### `blocks`

Unified tree table for Topics and Lessons.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `course_id` | uuid FK→courses | cascade delete |
| `parent_id` | uuid FK→blocks | null = top-level topic |
| `type` | block_type | `topic` or `lesson` |
| `name` | varchar | |
| `description` | text | |
| `order` | integer | position among siblings |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

Constraints: `type = 'lesson'` → `parent_id` must not be null; `type = 'topic'` → `parent_id` must be null.

---

### `course_media`

Junction — media files attached to a course.

| Column | Type | Notes |
|--------|------|-------|
| `course_id` | uuid FK→courses | PK composite |
| `file_id` | uuid FK→file_uploads | PK composite |

---

### `block_media`

Junction — media files attached to a block. Each lesson must have exactly one video.

| Column | Type | Notes |
|--------|------|-------|
| `block_id` | uuid FK→blocks | PK composite |
| `file_id` | uuid FK→file_uploads | PK composite |

---

### `course_enrolled`

User follows (enrolls in) a course.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK→users | |
| `course_id` | uuid FK→courses | |
| `followed_at` | timestamptz | |

Unique: `(user_id, course_id)`

---

### `block_progress`

Per-user progress on each block.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK→users | |
| `block_id` | uuid FK→blocks | |
| `watch_progress` | integer | 0–100, lessons only |
| `completed` | boolean | default `false` |
| `completed_at` | timestamptz | null until complete |
| `updated_at` | timestamptz | |

Unique: `(user_id, block_id)`

Topic and Course completion is **derived** from child `block_progress` rows — not stored.

---

### `course_invites`

Shareable enrollment invite links.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `course_id` | uuid FK→courses | |
| `created_by` | uuid FK→users | |
| `token` | varchar | unique, url-safe random |
| `created_at` | timestamptz | |
| `expires_at` | timestamptz | null = no expiry |

---

## Relations

```
users ──< courses           creator_id
users ──< file_uploads      user_id
users ──< course_enrolled    user_id
users ──< block_progress    user_id
users ──< course_invites    created_by

courses ──< blocks          course_id
courses ──< course_media    course_id
courses ──< course_enrolled  course_id
courses ──< course_invites  course_id

blocks ──< blocks           parent_id  (self-ref)
blocks ──< block_media      block_id
blocks ──< block_progress   block_id

file_uploads ──< course_media   file_id
file_uploads ──< block_media    file_id
```

---

## Notes

- **Learning activity** (daily / weekly / monthly / all-time) — computed from `block_progress.completed_at`; no separate aggregation table needed.
- `course_enrolled` is the enrollment record — invite-based and direct enrollment both land here.
- Soft-delete courses via `status = 'deleted'`.
- Supabase Auth manages authentication; `users.id` mirrors the Supabase Auth UID.
