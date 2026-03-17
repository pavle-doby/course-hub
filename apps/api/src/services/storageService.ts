import { supabase } from '../utils/supabase';
import { BadRequestError, InternalServerError, NotFoundError } from '../types/errors';

export interface UploadFileOptions {
  bucketName: string;
  fileName: string;
  file: ArrayBuffer | ArrayBufferView | string;
  contentType?: string;
  isPublic?: boolean;
  upsert?: boolean;
}

export interface DownloadFileOptions {
  bucketName: string;
  fileName: string;
}

export interface DeleteFileOptions {
  bucketName: string;
  path: string | null;
  fileName: string;
}

export interface ListFilesOptions {
  bucketName: string;
  folder?: string;
  limit?: number;
  offset?: number;
}

// TODO@pavle: Double check this
export interface FileInfo {
  name: string;
  id: string | null;
  updated_at: string | null;
  created_at: string | null;
  last_accessed_at: string | null;
  metadata: Record<string, unknown> | null;
}

export interface UploadResult {
  path: string;
  id: string;
  fullPath: string;
  publicUrl: string | null;
}

export const storageService = {
  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(options: UploadFileOptions): Promise<UploadResult> {
    const {
      bucketName,
      fileName,
      file,
      contentType,
      isPublic = false,
      upsert = false,
    } = options;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType,
        upsert,
      });

    if (error) {
      throw new BadRequestError({
        error: new Error(`Failed to upload file: ${error.message}`),
        details: { originalError: error.message },
      });
    }

    if (!data) {
      throw new InternalServerError({
        error: new Error('Upload succeeded but no data returned'),
      });
    }

    const result: UploadResult = {
      path: data.path,
      id: data.id,
      fullPath: data.fullPath,
      publicUrl: null,
    };

    // Get public URL if requested
    if (isPublic) {
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      result.publicUrl = publicUrlData.publicUrl;
    }

    return result;
  },

  /**
   * Download a file from Supabase Storage
   */
  async downloadFile(
    options: DownloadFileOptions
  ): Promise<{ data: unknown; fileName: string }> {
    const { bucketName, fileName } = options;

    const { data, error } = await supabase.storage.from(bucketName).download(fileName);

    if (error) {
      if (
        error.message.includes('not found') ||
        error.message.includes('does not exist')
      ) {
        throw new NotFoundError({
          error: new Error(`File not found: ${fileName}`),
          details: { originalError: error.message },
        });
      }
      throw new BadRequestError({
        error: new Error(`Failed to download file: ${error.message}`),
        details: { originalError: error.message },
      });
    }

    if (!data) {
      throw new NotFoundError({
        error: new Error(`File not found: ${fileName}`),
      });
    }

    return { data, fileName };
  },

  /**
   * Delete a file from Supabase Storage
   */
  async deleteFile(options: DeleteFileOptions): Promise<void> {
    const { bucketName, fileName, path } = options;
    const folder = path ? `${path}/` : '';
    const name = `${folder}${fileName}`;

    const { error } = await supabase.storage.from(bucketName).remove([name]);

    if (error) {
      throw new BadRequestError({
        error: new Error(`Failed to delete file: ${error.message}`),
        details: { originalError: error.message },
      });
    }
  },

  /**
   * List files in a bucket
   */
  async listFiles(options: ListFilesOptions): Promise<FileInfo[]> {
    const { bucketName, folder = '', limit = 100, offset = 0 } = options;

    const { data, error } = await supabase.storage.from(bucketName).list(folder, {
      limit,
      offset,
    });

    if (error) {
      throw new BadRequestError({
        error: new Error(`Failed to list files: ${error.message}`),
        details: { originalError: error.message },
      });
    }

    return data || [];
  },

  /**
   * Get public URL for a file (if bucket is public)
   */
  getPublicUrl(bucketName: string, fileName: string): string {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);

    return data.publicUrl;
  },

  /**
   * Check if a file exists in the bucket
   */
  async fileExists(bucketName: string, fileName: string): Promise<boolean> {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(fileName.split('/').slice(0, -1).join('/'), {
        search: fileName.split('/').pop(),
      });

    if (error) {
      return false;
    }

    return data && data.length > 0;
  },

  /**
   * Get file metadata
   */
  async getFileInfo(bucketName: string, fileName: string): Promise<FileInfo> {
    const folder = fileName.split('/').slice(0, -1).join('/');
    const fileNameOnly = fileName.split('/').pop() || fileName;

    const { data, error } = await supabase.storage.from(bucketName).list(folder, {
      search: fileNameOnly,
    });

    if (error) {
      throw new BadRequestError({
        error: new Error(`Failed to get file info: ${error.message}`),
        details: { originalError: error.message },
      });
    }

    const fileInfo = data?.find((file) => file.name === fileNameOnly);

    if (!fileInfo) {
      throw new NotFoundError({
        error: new Error(`File not found: ${fileName}`),
      });
    }

    return fileInfo;
  },
};
