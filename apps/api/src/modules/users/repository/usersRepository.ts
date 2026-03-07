import {
  CreateUserReq,
  UpdateUserReq,
  Search,
  FilterUser,
  GetAllUsersRes,
} from "@repo/contract";
import { db, schema } from "@repo/db";
import { PaginationReqExtended } from "api/middleware/pagination";
import { eq, desc, ilike, or, and, count } from "drizzle-orm";

export const usersRepository = {
  getUserByEmail: async (email: string) => {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    return user;
  },
  getAllUsersWithProfiles: async ({
    offset,
    limit,
    page,
    query,
    status,
    role,
  }: PaginationReqExtended &
    Partial<Search & FilterUser>): Promise<GetAllUsersRes> => {
    // Build search condition
    const searchCondition = query
      ? or(
          ilike(schema.users.email, `%${query}%`),
          ilike(schema.users.firstName, `%${query}%`),
          ilike(schema.users.lastName, `%${query}%`),
        )
      : undefined;

    // Build filter conditions
    const statusFilterCondition = status
      ? eq(schema.users.status, status)
      : undefined;

    const roleFilterCondition = role ? eq(schema.users.role, role) : undefined;

    // Combine all conditions
    const conditions = [
      searchCondition,
      statusFilterCondition,
      roleFilterCondition,
    ].filter(Boolean);
    const whereClause =
      conditions.length > 1 ? and(...conditions) : conditions[0];

    // Get total count
    const [{ count: dataCount }] = await db
      .select({ count: count() })
      .from(schema.users)
      .where(whereClause);

    const total = dataCount || 0;

    // Get paginated data
    const data = await db.query.users.findMany({
      where: whereClause,
      offset,
      limit,
      orderBy: [desc(schema.users.createdAt)],
      columns: {
        createdAt: false,
        updatedAt: false,
        lastLogin: false,
      },
    });

    return {
      data,
      pagination: {
        total,
        page,
        limit: limit || total,
      },
    };
  },
  getUserWithProfile: async (id: string) => {
    return await db.query.users.findFirst({
      where: eq(schema.users.id, id),
      columns: {
        createdAt: false,
        updatedAt: false,
        lastLogin: false,
      },
    });
  },
  createUser: async (data: CreateUserReq) => {
    return await db.insert(schema.users).values(data).returning({
      id: schema.users.id,
      email: schema.users.email,
      image: schema.users.image,
      firstName: schema.users.firstName,
      lastName: schema.users.lastName,
      role: schema.users.role,
      status: schema.users.status,
    });
  },
  updateUser: async (id: string, data: UpdateUserReq) => {
    return await db
      .update(schema.users)
      .set(data)
      .where(eq(schema.users.id, id))
      .returning({
        id: schema.users.id,
        email: schema.users.email,
        image: schema.users.image,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        role: schema.users.role,
        status: schema.users.status,
      });
  },
  deleteUser: async (id: string) => {
    return await db
      .delete(schema.users)
      .where(eq(schema.users.id, id))
      .returning();
  },
};
