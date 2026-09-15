import { registry } from "api/openapi/registry";
import {
  ApiErrorSchema,
  DocumentParentParamsSchema,
  DocumentReorderBodySchema,
  DocumentUploadBodySchema,
  DocumentUploadParamsSchema,
  DocumentUploadResponseSchema,
  ParamsIdSchema,
} from "@repo/contract";

const errorResponse = {
  description: "Error",
  content: { "application/json": { schema: ApiErrorSchema } },
};

registry.registerPath({
  method: "post",
  path: "/v1/documents/uploads",
  operationId: "initializeDocumentUpload",
  tags: ["Documents"],
  request: { body: { content: { "application/json": { schema: DocumentUploadBodySchema } } } },
  responses: {
    201: {
      description: "Direct upload initialized",
      content: { "application/json": { schema: DocumentUploadResponseSchema } },
    },
    default: errorResponse,
  },
});

registry.registerPath({
  method: "post",
  path: "/v1/documents/uploads/{id}/complete",
  operationId: "completeDocumentUpload",
  tags: ["Documents"],
  request: { params: DocumentUploadParamsSchema },
  responses: { 204: { description: "Document upload completed" }, default: errorResponse },
});

registry.registerPath({
  method: "put",
  path: "/v1/documents/{parentType}/{parentId}/order",
  operationId: "reorderDocuments",
  tags: ["Documents"],
  request: {
    params: DocumentParentParamsSchema,
    body: { content: { "application/json": { schema: DocumentReorderBodySchema } } },
  },
  responses: { 204: { description: "Document order updated" }, default: errorResponse },
});

registry.registerPath({
  method: "delete",
  path: "/v1/documents/{id}",
  operationId: "deleteDocument",
  tags: ["Documents"],
  request: { params: ParamsIdSchema },
  responses: { 204: { description: "Document deleted" }, default: errorResponse },
});
