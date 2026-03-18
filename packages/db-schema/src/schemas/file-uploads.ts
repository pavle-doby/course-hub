import { pgTable, varchar, timestamp, integer, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

// File uploads table
export const fileUploads = pgTable('file_uploads', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  url: varchar('url', { length: 500 }).notNull(),
  publicUrl: varchar('public_url', { length: 500 }),
  fullPath: varchar('full_path', { length: 255 }).notNull(),
  bucket: varchar('bucket', { length: 100 }).notNull(),
  path: varchar('path', { length: 255 }),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow().notNull(),
  type: varchar('type', { length: 100 }),
  size: integer('size'), // in bytes
});
