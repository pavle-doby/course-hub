import { Router, Request, Response } from "express";
import { usersController } from "../controllers/usersController";
import { pagination } from "api/middleware/pagination";
import { validate } from "api/middleware/validate";
import {
  UserGetAllQuerySchema,
  UserPostQuerySchema,
  UserPutQuerySchema,
} from "@repo/contract";
import { ParamsIdSchema, SearchSchema } from "@repo/contract";
import { validateAdminRole } from "api/middleware/validateRole";

const router: Router = Router();

// GET /users/self → fetch current user
router.get("/self", async (_req: Request, res: Response) => {
  await usersController.getSelf(res);
});

// GET /users → get all users
router.get(
  "/",
  validateAdminRole(),
  pagination(),
  validate(SearchSchema, "query"),
  validate(UserGetAllQuerySchema, "query"),
  async (req: Request, res: Response) => {
    await usersController.getAllUsers(req, res);
  },
);

// GET /users/:id → get user by id
router.get(
  "/:id",
  validateAdminRole(),
  validate(ParamsIdSchema, "params"),
  async (req: Request, res: Response) => {
    await usersController.getUser(req, res);
  },
);

// POST /users → create new user
router.post(
  "/",
  validateAdminRole(),
  validate(UserPostQuerySchema),
  async (req: Request, res: Response) => {
    await usersController.createUser(req, res);
  },
);

// PUT /users/:id → update user by id
router.put(
  "/:id",
  validate(ParamsIdSchema, "params"),
  validate(UserPutQuerySchema),
  async (req: Request, res: Response) => {
    await usersController.updateUser(req, res);
  },
);

// DELETE /users/:id → delete user by id
router.delete(
  "/:id",
  validateAdminRole(),
  validate(ParamsIdSchema, "params"),
  async (req: Request, res: Response) => {
    await usersController.deleteUser(req, res);
  },
);

export default router;
