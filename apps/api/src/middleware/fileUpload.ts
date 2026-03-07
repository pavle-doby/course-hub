import { Request, Response, NextFunction } from 'express';

export interface FileUploadBody {
  file?: ArrayBuffer | string;
  fileName?: string;
  fileContentType?: string;
  fileBucketName?: string;
  [key: string]: unknown;
}

/**
 * Middleware to handle file uploads from JSON with base64 encoded files
 * Converts base64 strings to ArrayBuffer for the file service
 */
export const fileUpload = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if file data is present and is a base64 string
      if (req.body?.file && typeof req.body.file === 'string') {
        // Check if it's a base64 string (contains data: prefix or is pure base64)
        let base64Data = req.body.file;

        // Remove data URL prefix if present (e.g., "data:image/png;base64,")
        if (base64Data.startsWith('data:')) {
          const base64Index = base64Data.indexOf(',');
          if (base64Index !== -1) {
            base64Data = base64Data.substring(base64Index + 1);
          }
        }

        try {
          // Convert base64 string to ArrayBuffer
          const binaryString = globalThis.atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);

          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          // Replace the string with ArrayBuffer
          req.body.file = bytes.buffer;
        } catch (_error) {
          // If base64 conversion fails, keep as string (might be raw binary data)
          // File will be handled as-is by the storage service
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
