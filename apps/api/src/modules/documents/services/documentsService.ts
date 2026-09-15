import { randomUUID } from "node:crypto";
import {
  BadRequestError,
  ErrorCode,
  ErrorCodeDocument,
  ForbiddenError,
  NotFoundError,
  type CompleteDocumentUploadReq,
  type GetDocumentsByParentReq,
  type GetDocumentsByParentRes,
  type InitializeDocumentUploadReq,
  type InitializeDocumentUploadRes,
  type ReorderDocumentsReq,
} from "@repo/contract";
import { env } from "api/env";
import { usersRepository } from "api/modules/users/repository/usersRepository";
import { documentsRepository } from "../repository/documentsRepository";
import { r2Service } from "./r2Service";

const MAX_DOCUMENTS_PER_PARENT = 20;

function parentFromDocument(document: {
  courseId: string | null;
  topicId: string | null;
  lessonId: string | null;
}): GetDocumentsByParentReq {
  if (document.courseId) {
    return { parentType: "course", parentId: document.courseId };
  }
  if (document.topicId) {
    return { parentType: "topic", parentId: document.topicId };
  }
  return { parentType: "lesson", parentId: document.lessonId! };
}

async function assertCreator(parent: GetDocumentsByParentReq, authUserId: string): Promise<string> {
  const user = await usersRepository.getUserByAuthUserId(authUserId);
  if (!user) {
    throw new ForbiddenError({ code: ErrorCode.FORBIDDEN });
  }

  const owner = await documentsRepository.getParentCreator(parent);
  if (!owner) {
    throw new NotFoundError({ code: ErrorCodeDocument.INVALID_PARENT });
  }
  if (owner.creatorId !== user.id) {
    throw new ForbiddenError({ code: ErrorCode.FORBIDDEN });
  }

  return user.id;
}

function publicUrl(objectKey: string): string {
  return new URL(objectKey, `${env.CLOUDFLARE_R2_PUBLIC_URL.replace(/\/$/, "")}/`).toString();
}

export const documentsService = {
  getByParent: async (parent: GetDocumentsByParentReq): Promise<GetDocumentsByParentRes> => {
    const documents = await documentsRepository.listReadyByParent(parent);
    return documents.map((document) => ({
      id: document.id,
      courseId: document.courseId,
      topicId: document.topicId,
      lessonId: document.lessonId,
      originalFileName: document.originalFileName,
      contentType: document.contentType,
      sizeBytes: document.sizeBytes,
      position: document.position,
      publicUrl: publicUrl(document.objectKey),
    }));
  },

  initializeUpload: async (
    dto: InitializeDocumentUploadReq,
    authUserId: string
  ): Promise<InitializeDocumentUploadRes> => {
    const userId = await assertCreator(dto, authUserId);
    const count = await documentsRepository.countByParent(dto);
    if (count >= MAX_DOCUMENTS_PER_PARENT) {
      throw new BadRequestError({ code: ErrorCodeDocument.LIMIT_EXCEEDED });
    }

    const objectKey = `${authUserId}/course-content/${dto.parentType}/${dto.parentId}/${randomUUID()}`;
    const document = await documentsRepository.create({
      parent: dto,
      uploadedByUserId: userId,
      objectKey,
      originalFileName: dto.fileName,
      contentType: dto.mimeType,
      sizeBytes: dto.size,
      position: count,
    });
    try {
      const uploadUrl = await r2Service.createUploadUrl(objectKey, dto.mimeType);
      return { id: document.id, uploadUrl, requiredHeaders: { "Content-Type": dto.mimeType } };
    } catch (error) {
      await documentsRepository.deleteById(document.id);
      throw error;
    }
  },

  completeUpload: async (dto: CompleteDocumentUploadReq, authUserId: string): Promise<void> => {
    const document = await documentsRepository.getById(dto.id);
    if (!document) {
      throw new NotFoundError({ code: ErrorCodeDocument.NOT_FOUND });
    }
    await assertCreator(parentFromDocument(document), authUserId);
    try {
      const object = await r2Service.headObject(document.objectKey);
      if (
        object.ContentLength !== document.sizeBytes ||
        object.ContentType !== document.contentType
      ) {
        throw new BadRequestError({ code: ErrorCodeDocument.UPLOAD_FAILED });
      }
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError({ code: ErrorCodeDocument.UPLOAD_NOT_READY });
    }
    await documentsRepository.markReady(document.id);
  },

  reorder: async (
    parent: GetDocumentsByParentReq,
    dto: ReorderDocumentsReq,
    authUserId: string
  ): Promise<void> => {
    await assertCreator(parent, authUserId);
    const documents = await documentsRepository.listReadyByParent(parent);
    if (
      documents.length !== dto.documentIds.length ||
      new Set(dto.documentIds).size !== dto.documentIds.length
    ) {
      throw new BadRequestError({ code: ErrorCodeDocument.NOT_FOUND });
    }
    await documentsRepository.reorder(parent, dto.documentIds);
  },

  delete: async (id: string, authUserId: string): Promise<void> => {
    const document = await documentsRepository.getById(id);
    if (!document) {
      throw new NotFoundError({ code: ErrorCodeDocument.NOT_FOUND });
    }
    await assertCreator(parentFromDocument(document), authUserId);
    await r2Service.deleteObject(document.objectKey);
    await documentsRepository.deleteById(id);
  },

  deleteForCourse: async (courseId: string): Promise<void> => {
    const documents = await documentsRepository.listObjectKeysForCourse(courseId);
    for (const document of documents) {
      await r2Service.deleteObject(document.objectKey);
    }
  },

  deleteForTopic: async (topicId: string): Promise<void> => {
    const documents = await documentsRepository.listObjectKeysForTopic(topicId);
    for (const document of documents) {
      await r2Service.deleteObject(document.objectKey);
    }
  },

  deleteForLesson: async (lessonId: string): Promise<void> => {
    const documents = await documentsRepository.listObjectKeysForLesson(lessonId);
    for (const document of documents) {
      await r2Service.deleteObject(document.objectKey);
    }
  },
};
