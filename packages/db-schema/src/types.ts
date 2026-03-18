import type { fileUploads, users } from './schemas';
import type { InferSelectModel } from 'drizzle-orm';

// Users types
export type UserEntity = InferSelectModel<typeof users>;

// File uploads types
export type FileUploadEntity = InferSelectModel<typeof fileUploads>;
