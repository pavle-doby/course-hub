import { CreateUserReq, UpdateUserReq, Search, FilterUser, GetAllUsersRes } from "@repo/contract";
import { db, schema } from "@repo/db";
import { PaginationReqExtended } from "api/middleware/pagination";
import { eq, desc, ilike, or, and, count } from "drizzle-orm";

export const usersRepository = {
  getUserByAuthUserId: async (authUserId: string) => {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.authUserId, authUserId))
      .limit(1);

    return user;
  },
  getAllUsersWithProfiles: async ({
    offset,
    limit,
    page,
    query,
    role,
  }: PaginationReqExtended & Partial<Search & FilterUser>): Promise<GetAllUsersRes> => {
    const searchCondition = query
      ? or(
          ilike(schema.users.username, `%${query}%`),
          ilike(schema.users.firstName, `%${query}%`),
          ilike(schema.users.lastName, `%${query}%`)
        )
      : undefined;

    const roleFilterCondition = role ? eq(schema.users.role, role) : undefined;

    const conditions = [searchCondition, roleFilterCondition].filter(Boolean);
    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

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
        authUserId: false,
        createdAt: false,
        updatedAt: false,
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
        authUserId: false,
        createdAt: false,
        updatedAt: false,
      },
    });
  },
  createUser: async (data: CreateUserReq) => {
    return await db.insert(schema.users).values(data).returning({
      id: schema.users.id,
      email: schema.users.email,
      firstName: schema.users.firstName,
      lastName: schema.users.lastName,
      username: schema.users.username,
      avatarUrl: schema.users.avatarUrl,
      bio: schema.users.bio,
      role: schema.users.role,
    });
  },
  updateUser: async (id: string, data: UpdateUserReq) => {
    return await db.update(schema.users).set(data).where(eq(schema.users.id, id)).returning({
      id: schema.users.id,
      email: schema.users.email,
      firstName: schema.users.firstName,
      lastName: schema.users.lastName,
      username: schema.users.username,
      avatarUrl: schema.users.avatarUrl,
      bio: schema.users.bio,
      role: schema.users.role,
    });
  },
  deleteUser: async (id: string) => {
    return await db.delete(schema.users).where(eq(schema.users.id, id)).returning({
      id: schema.users.id,
      email: schema.users.email,
      firstName: schema.users.firstName,
      lastName: schema.users.lastName,
      username: schema.users.username,
      avatarUrl: schema.users.avatarUrl,
      bio: schema.users.bio,
      role: schema.users.role,
    });
  },
};
