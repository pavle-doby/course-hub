import { paramBoolean } from "api/validation/paramBoolean";
import { z } from "zod";

// Schema for GET /users query parameters (filtering)
export const UserSchemaGetAll = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  role: z.enum(["user", "admin"]).optional(),
  requiresFileUpload: paramBoolean().optional(),
});

// Schema for POST /users (create new user)
export const UserSchemaPost = z.object({
  email: z.email(),
  image: z.string().optional(),
  firstName: z.string().min(1).max(255).optional(),
  lastName: z.string().min(1).max(255).optional(),
  role: z.enum(["user", "admin"]).optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  requiresFileUpload: z.boolean().optional(),
});

// Schema for PUT /users/:id (update existing user)
export const UserSchemaPut = z.object({
  email: z.email().optional(),
  image: z.string().optional().nullable(),
  firstName: z.string().min(1).max(255).optional(),
  lastName: z.string().min(1).max(255).optional(),
  role: z.enum(["user", "admin"]).optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  requiresFileUpload: z.boolean().optional(),
});
