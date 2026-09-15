import type { Request, Response } from "express";
import type {
  CompleteDocumentUploadReq,
  GetDocumentsByParentReq,
  GetDocumentsByParentRes,
  InitializeDocumentUploadReq,
  InitializeDocumentUploadRes,
  ReorderDocumentsReq,
} from "@repo/contract";
import { documentsService } from "../services/documentsService";

export const documentsController = {
  getByParent: async (_req: Request, res: Response): Promise<void> => {
    const dto = res.locals.params as GetDocumentsByParentReq;
    const documents: GetDocumentsByParentRes = await documentsService.getByParent(dto);
    res.status(200).json(documents);
  },

  initializeUpload: async (_req: Request, res: Response): Promise<void> => {
    const dto = res.locals.body as InitializeDocumentUploadReq;
    const document: InitializeDocumentUploadRes = await documentsService.initializeUpload(
      dto,
      res.locals.user.id
    );
    res.status(201).json(document);
  },

  completeUpload: async (_req: Request, res: Response): Promise<void> => {
    const dto = res.locals.params as CompleteDocumentUploadReq;
    await documentsService.completeUpload(dto, res.locals.user.id);
    res.status(204).send();
  },

  reorder: async (_req: Request, res: Response): Promise<void> => {
    const parent = res.locals.params as GetDocumentsByParentReq;
    const dto = res.locals.body as ReorderDocumentsReq;
    await documentsService.reorder(parent, dto, res.locals.user.id);
    res.status(204).send();
  },

  delete: async (_req: Request, res: Response): Promise<void> => {
    await documentsService.delete((res.locals.params as { id: string }).id, res.locals.user.id);
    res.status(204).send();
  },
};
