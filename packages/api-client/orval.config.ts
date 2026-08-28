import { defineConfig } from "orval";

export default defineConfig({
  auth: {
    input: "../../apps/api/openapi.json",
    output: {
      mode: "tags-split",
      target: "./src/generated",
      client: "react-query",
      httpClient: "axios",
      indexFiles: true,
      override: {
        useNamedParameters: true,
        mutator: {
          path: "./src/lib/apiClient.ts",
          name: "customInstance",
        },
      },
    },
  },
});
