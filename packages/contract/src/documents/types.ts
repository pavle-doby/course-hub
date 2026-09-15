import { z } from "zod";
import {
  DocumentParentParamsSchema,
  DocumentReorderBodySchema,
  DocumentSchema,
  DocumentUploadBodySchema,
  DocumentUploadParamsSchema,
  DocumentUploadResponseSchema,
  PublicDocumentSchema,
} from "./schemas";

export type Document = z.infer<typeof DocumentSchema>;
export type PublicDocument = z.infer<typeof PublicDocumentSchema>;
export type GetDocumentsByParentReq = z.infer<typeof DocumentParentParamsSchema>;
export type GetDocumentsByParentRes = PublicDocument[];
export type InitializeDocumentUploadReq = z.infer<typeof DocumentUploadBodySchema>;
export type InitializeDocumentUploadRes = z.infer<typeof DocumentUploadResponseSchema>;
export type CompleteDocumentUploadReq = z.infer<typeof DocumentUploadParamsSchema>;
export type ReorderDocumentsReq = z.infer<typeof DocumentReorderBodySchema>;
