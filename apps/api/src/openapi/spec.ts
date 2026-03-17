import { OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import type { OpenAPIObject } from "openapi3-ts/oas31";
import { registry } from "./registry";

// Side-effect imports: register all paths into the registry
import "../modules/auth/openapi/auth";
import "../modules/users/openapi/users";

export function generateOpenAPIDocument(): OpenAPIObject {
  const generator = new OpenApiGeneratorV31(registry.definitions);

  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "Course Hub API",
      version: "1.0.0",
    },
    servers: [{ url: "/api" }],
  });
}
