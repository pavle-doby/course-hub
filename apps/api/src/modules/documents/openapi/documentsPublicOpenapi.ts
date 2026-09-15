import { registry } from "api/openapi/registry";
import { ApiErrorSchema, DocumentParentParamsSchema } from "@repo/contract";
import { PublicDocumentSchema } from "api/openapi/schemas";

registry.registerPath({
  method: "get",
  path: "/v1/public/documents/{parentType}/{parentId}",
  operationId: "getPublicDocumentsByParent",
  tags: ["Documents"],
  security: [],
  request: { params: DocumentParentParamsSchema },
  responses: {
    200: {
      description: "Public documents",
      content: { "application/json": { schema: PublicDocumentSchema.array() } },
    },
    default: { description: "Error", content: { "application/json": { schema: ApiErrorSchema } } },
  },
});
