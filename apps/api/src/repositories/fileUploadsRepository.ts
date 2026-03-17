import { db, schema } from '@my/db';
import { eq, desc, and, count, ilike } from 'drizzle-orm';
import { PaginationReqExtended } from '../middleware/pagination';
import { FileUploadEntity } from '@my/db-schema';
import { PaginationRes } from '@my/contract';

export interface FileUploadFilters {
  userId?: string;
  type?: string;
  bucket?: string;
  query?: string; // search in fileName
}
export type GetAllFileUploadsResult = PaginationRes<FileUploadEntity>;

export type CreateFileUploadData = Omit<FileUploadEntity, 'id' | 'uploadedAt'>;

export type UpdateFileUploadData = Partial<
  Omit<FileUploadEntity, 'id' | 'userId' | 'uploadedAt'>
>;

export const fileUploadsRepository = {
  /**
   * Create a new file upload record
   */
  async create(data: CreateFileUploadData) {
    const [fileUpload] = await db
      .insert(schema.fileUploads)
      .values({
        userId: data.userId,
        url: data.url,
        publicUrl: data.publicUrl,
        fullPath: data.fullPath,
        bucket: data.bucket,
        path: data.path,
        fileName: data.fileName,
        type: data.type,
        size: data.size,
      })
      .returning();

    return fileUpload;
  },

  /**
   * Get a file upload by ID
   */
  async getById(id: string) {
    const [fileUpload] = await db
      .select()
      .from(schema.fileUploads)
      .where(eq(schema.fileUploads.id, id))
      .limit(1);

    return fileUpload;
  },

  /**
   * Get all file uploads for a specific user
   */
  async getByUserId(userId: string) {
    const fileUploads = await db
      .select()
      .from(schema.fileUploads)
      .where(eq(schema.fileUploads.userId, userId))
      .orderBy(desc(schema.fileUploads.uploadedAt));

    return fileUploads;
  },

  /**
   * Get all file uploads with pagination and filtering
   */
  async getAll({
    offset = 0,
    limit = 50,
    page,
    userId,
    type,
    bucket,
    query,
  }: PaginationReqExtended & FileUploadFilters): Promise<GetAllFileUploadsResult> {
    // Build search condition for fileName
    const searchCondition = query
      ? ilike(schema.fileUploads.fileName, `%${query}%`)
      : undefined;

    // Build filter conditions
    const userFilterCondition = userId
      ? eq(schema.fileUploads.userId, userId)
      : undefined;

    const fileTypeFilterCondition = type ? eq(schema.fileUploads.type, type) : undefined;

    const bucketFilterCondition = bucket
      ? eq(schema.fileUploads.bucket, bucket)
      : undefined;

    // Combine all conditions
    const whereConditions = and(
      searchCondition,
      userFilterCondition,
      fileTypeFilterCondition,
      bucketFilterCondition
    );

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(schema.fileUploads)
      .where(whereConditions);

    // Get paginated data
    const data = await db
      .select({
        id: schema.fileUploads.id,
        userId: schema.fileUploads.userId,
        url: schema.fileUploads.url,
        publicUrl: schema.fileUploads.publicUrl,
        fullPath: schema.fileUploads.fullPath,
        bucket: schema.fileUploads.bucket,
        path: schema.fileUploads.path,
        fileName: schema.fileUploads.fileName,
        uploadedAt: schema.fileUploads.uploadedAt,
        type: schema.fileUploads.type,
        size: schema.fileUploads.size,
      })
      .from(schema.fileUploads)
      .where(whereConditions)
      .orderBy(desc(schema.fileUploads.uploadedAt))
      .limit(limit)
      .offset(offset);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
      },
    };
  },

  /**
   * Update a file upload record
   */
  async update(id: string, data: UpdateFileUploadData) {
    const [fileUpload] = await db
      .update(schema.fileUploads)
      .set({
        url: data.url,
        publicUrl: data.publicUrl,
        fullPath: data.fullPath,
        bucket: data.bucket,
        path: data.path,
        fileName: data.fileName,
        type: data.type,
        size: data.size,
      })
      .where(eq(schema.fileUploads.id, id))
      .returning();

    return fileUpload;
  },

  /**
   * Delete a file upload record
   */
  async delete(id: string) {
    const [deletedFileUpload] = await db
      .delete(schema.fileUploads)
      .where(eq(schema.fileUploads.id, id))
      .returning();

    return deletedFileUpload;
  },

  /**
   * Delete all file uploads for a specific user
   */
  async deleteByUserId(userId: string) {
    const deletedFileUploads = await db
      .delete(schema.fileUploads)
      .where(eq(schema.fileUploads.userId, userId))
      .returning();

    return deletedFileUploads;
  },

  /**
   * Check if a file upload exists
   */
  async exists(id: string): Promise<boolean> {
    const [fileUpload] = await db
      .select({ id: schema.fileUploads.id })
      .from(schema.fileUploads)
      .where(eq(schema.fileUploads.id, id))
      .limit(1);

    return !!fileUpload;
  },

  /**
   * Get file uploads count by user
   */
  async getCountByUserId(userId: string): Promise<number> {
    const [{ total }] = await db
      .select({ total: count() })
      .from(schema.fileUploads)
      .where(eq(schema.fileUploads.userId, userId));

    return total;
  },

  /**
   * Get recent file uploads (last N uploads)
   */
  async getRecent(limit: number = 10) {
    const fileUploads = await db
      .select()
      .from(schema.fileUploads)
      .orderBy(desc(schema.fileUploads.uploadedAt))
      .limit(limit);

    return fileUploads;
  },

  /**
   * Get file uploads by file type
   */
  async getByFileType(fileType: string) {
    const fileUploads = await db
      .select()
      .from(schema.fileUploads)
      .where(eq(schema.fileUploads.type, fileType))
      .orderBy(desc(schema.fileUploads.uploadedAt));

    return fileUploads;
  },

  /**
   * Get file upload statistics
   */
  async getStatistics() {
    const [totalUploads] = await db.select({ total: count() }).from(schema.fileUploads);

    const fileTypeStats = await db
      .select({
        fileType: schema.fileUploads.type,
        count: count(),
      })
      .from(schema.fileUploads)
      .groupBy(schema.fileUploads.type);

    return {
      totalUploads: totalUploads.total,
      fileTypeStats,
    };
  },
};
