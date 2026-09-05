import z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const PaginationSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export const paramBoolean = () =>
  z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .openapi({ type: "boolean" });

export const isoDatetime = () => z.iso.datetime().transform((date) => new Date(date));

export const ParamsIdSchema = z.object({
  id: z.uuid(),
});

export const SearchSchema = z.object({
  query: z.string().optional(),
});
