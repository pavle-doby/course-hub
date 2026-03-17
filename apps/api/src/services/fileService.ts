import { storageService } from './storageService';
import {
  fileUploadsRepository,
  CreateFileUploadData,
  UpdateFileUploadData,
  FileUploadFilters,
  GetAllFileUploadsResult,
} from '../repositories/fileUploadsRepository';
import { PaginationReqExtended } from '../middleware/pagination';
import { NotFoundError } from '../types/errors';

export interface UploadFileReq {
  userId: string;
  bucketName: string;
  file: ArrayBuffer | ArrayBufferView | string;
  fileName: string;
  contentType: string;
  isPublic: boolean;
  folder?: string;
}

export interface FileUploadRes {
  id: string;
  userId: string;
  url: string;
  publicUrl?: string;
  fullPath: string;
  bucket: string;
  path: string | null;
  fileName: string;
  type: string | null;
  size: number | null;
  uploadedAt: Date;
}

export interface UpdateFileReq {
  fileName?: string;
  contentType?: string;
  fullPath?: string;
  bucket?: string;
  path?: string;
}

export interface DownloadFileRes {
  data: unknown;
  fileName: string;
  fileInfo: {
    id: string;
    fileName: string;
    type: string | null;
    size: number | null;
  };
}

export const fileService = {
  /**
   * Upload a file and save its metadata to database
   */
  async uploadFile(request: UploadFileReq): Promise<FileUploadRes> {
    const {
      userId,
      bucketName,
      file,
      fileName,
      contentType,
      isPublic = false,
      folder = '',
    } = request;

    // Create the full file path with folder if provided
    const fileNameWithPath = folder ? `${folder}/${fileName}` : fileName;

    // Calculate file size if possible
    let fileSize: number | null = null;
    if (file instanceof ArrayBuffer) {
      fileSize = file.byteLength;
    }

    // Upload file to storage
    const uploadResult = await storageService.uploadFile({
      bucketName,
      fileName: fileNameWithPath,
      file,
      contentType,
      isPublic,
      upsert: false,
    });

    // Save metadata to database
    const fileUploadData: CreateFileUploadData = {
      userId,
      url: uploadResult.fullPath,
      publicUrl: uploadResult.publicUrl,
      fullPath: uploadResult.fullPath,
      bucket: bucketName,
      path: folder || null,
      fileName: fileName,
      type: contentType,
      size: fileSize,
    };

    const dbRecord = await fileUploadsRepository.create(fileUploadData);

    return {
      id: dbRecord.id,
      userId: dbRecord.userId,
      url: dbRecord.url,
      publicUrl: dbRecord.publicUrl || undefined,
      fullPath: dbRecord.fullPath,
      bucket: dbRecord.bucket,
      path: dbRecord.path,
      fileName: dbRecord.fileName,
      type: dbRecord.type,
      size: dbRecord.size,
      uploadedAt: dbRecord.uploadedAt,
    };
  },

  /**
   * Get file by ID
   */
  async getFileById(id: string): Promise<FileUploadRes | null> {
    const fileUpload = await fileUploadsRepository.getById(id);

    if (!fileUpload) {
      return null;
    }

    return {
      id: fileUpload.id,
      userId: fileUpload.userId,
      url: fileUpload.url,
      publicUrl: fileUpload.publicUrl || undefined,
      fullPath: fileUpload.fullPath,
      bucket: fileUpload.bucket,
      path: fileUpload.path,
      fileName: fileUpload.fileName,
      type: fileUpload.type,
      size: fileUpload.size,
      uploadedAt: fileUpload.uploadedAt,
    };
  },

  /**
   * Get all files for a user
   */
  async getUserFiles(userId: string): Promise<FileUploadRes[]> {
    const fileUploads = await fileUploadsRepository.getByUserId(userId);

    return fileUploads.map((file) => ({
      id: file.id,
      userId: file.userId,
      url: file.url,
      publicUrl: file.publicUrl || undefined,
      fullPath: file.fullPath,
      bucket: file.bucket,
      path: file.path,
      fileName: file.fileName,
      type: file.type,
      size: file.size,
      uploadedAt: file.uploadedAt,
    }));
  },

  /**
   * Get all files with pagination and filtering
   */
  async getAllFiles(
    params: PaginationReqExtended & FileUploadFilters
  ): Promise<GetAllFileUploadsResult> {
    return await fileUploadsRepository.getAll(params);
  },

  /**
   * Download a file
   */
  async downloadFile(id: string, bucketName: string): Promise<DownloadFileRes> {
    // Get file metadata from database
    const fileUpload = await fileUploadsRepository.getById(id);

    if (!fileUpload) {
      throw new NotFoundError({
        error: new Error('File not found in database'),
      });
    }

    // Download file from storage
    const downloadResult = await storageService.downloadFile({
      bucketName,
      fileName: fileUpload.url,
    });

    return {
      data: downloadResult.data,
      fileName: downloadResult.fileName,
      fileInfo: {
        id: fileUpload.id,
        fileName: fileUpload.fileName,
        type: fileUpload.type,
        size: fileUpload.size,
      },
    };
  },

  /**
   * Update file metadata
   */
  async updateFile(id: string, updates: UpdateFileReq): Promise<FileUploadRes> {
    // Check if file exists
    const exists = await fileUploadsRepository.exists(id);
    if (!exists) {
      throw new NotFoundError({
        error: new Error('File not found'),
      });
    }

    // Update database record
    const updateData: UpdateFileUploadData = {
      fileName: updates.fileName,
      type: updates.contentType,
      fullPath: updates.fullPath,
      bucket: updates.bucket,
      path: updates.path,
    };

    const updatedFile = await fileUploadsRepository.update(id, updateData);

    if (!updatedFile) {
      throw new NotFoundError({
        error: new Error('File not found after update'),
      });
    }

    return {
      id: updatedFile.id,
      userId: updatedFile.userId,
      url: updatedFile.url,
      publicUrl: updatedFile.publicUrl || undefined,
      fullPath: updatedFile.fullPath,
      bucket: updatedFile.bucket,
      path: updatedFile.path,
      fileName: updatedFile.fileName,
      type: updatedFile.type,
      size: updatedFile.size,
      uploadedAt: updatedFile.uploadedAt,
    };
  },

  /**
   * Delete a file (from both storage and database)
   */
  async deleteFile(id: string, bucketName: string): Promise<void> {
    // Get file metadata from database
    const fileUpload = await fileUploadsRepository.getById(id);

    if (!fileUpload) {
      throw new NotFoundError({
        error: new Error('File not found'),
      });
    }

    // Delete from storage first
    await storageService.deleteFile({
      bucketName,
      path: fileUpload.path,
      fileName: fileUpload.fileName,
    });

    // Delete from database
    await fileUploadsRepository.delete(id);
  },

  /**
   * Delete all files for a user
   */
  async deleteUserFiles(userId: string, bucketName: string): Promise<number> {
    const userFiles = await fileUploadsRepository.getByUserId(userId);
    let deletedCount = 0;

    for (const file of userFiles) {
      await storageService.deleteFile({
        bucketName,
        fileName: file.fileName,
        path: file.path,
      });
      deletedCount++;
    }

    // Delete all records from database
    await fileUploadsRepository.deleteByUserId(userId);

    return deletedCount;
  },

  /**
   * Get public URL for a file
   */
  async getPublicUrl(id: string, bucketName: string): Promise<string> {
    const fileUpload = await fileUploadsRepository.getById(id);

    if (!fileUpload) {
      throw new NotFoundError({
        error: new Error('File not found'),
      });
    }

    return storageService.getPublicUrl(bucketName, fileUpload.url);
  },

  /**
   * Check if a file exists in both database and storage
   */
  async fileExists(id: string, bucketName: string): Promise<boolean> {
    const fileUpload = await fileUploadsRepository.getById(id);

    if (!fileUpload) {
      return false;
    }

    const existsInStorage = await storageService.fileExists(bucketName, fileUpload.url);
    return existsInStorage;
  },

  /**
   * Get file statistics
   */
  async getFileStatistics() {
    return await fileUploadsRepository.getStatistics();
  },

  /**
   * Get recent files
   */
  async getRecentFiles(limit: number = 10): Promise<FileUploadRes[]> {
    const recentFiles = await fileUploadsRepository.getRecent(limit);

    return recentFiles.map((file) => ({
      id: file.id,
      userId: file.userId,
      url: file.url,
      publicUrl: file.publicUrl || undefined,
      fullPath: file.fullPath,
      bucket: file.bucket,
      path: file.path,
      fileName: file.fileName,
      type: file.type,
      size: file.size,
      uploadedAt: file.uploadedAt,
    }));
  },

  /**
   * Get files by type
   */
  async getFilesByType(fileType: string): Promise<FileUploadRes[]> {
    const files = await fileUploadsRepository.getByFileType(fileType);

    return files.map((file) => ({
      id: file.id,
      userId: file.userId,
      url: file.url,
      publicUrl: file.publicUrl || undefined,
      fullPath: file.fullPath,
      bucket: file.bucket,
      path: file.path,
      fileName: file.fileName,
      type: file.type,
      size: file.size,
      uploadedAt: file.uploadedAt,
    }));
  },

  /**
   * Get file count for a user
   */
  async getUserFileCount(userId: string): Promise<number> {
    return await fileUploadsRepository.getCountByUserId(userId);
  },
};
