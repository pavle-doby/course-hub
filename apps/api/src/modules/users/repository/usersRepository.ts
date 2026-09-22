import {
  CreateUserReq,
  UpdateUserReq,
  UpdateUserPreferencesReq,
  UserPreferences,
  Search,
  FilterUser,
  GetAllUsersRes,
  User,
} from "@repo/contract";
import { db, schema } from "@repo/db";
import { UserEntity } from "@repo/db-schema";
import { PaginationReqExtended } from "api/middleware/pagination";
import { eq, desc, ilike, or, and, count } from "drizzle-orm";

export const usersRepository = {
  getUserByAuthUserId: async (authUserId: string): Promise<UserEntity | undefined> => {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.authUserId, authUserId))
      .limit(1);

    return user;
  },
  getByEmail: async (email: string): Promise<UserEntity | undefined> => {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    return user;
  },
  getUserPreferences: async (userId: string): Promise<UserPreferences | undefined> => {
    const [preferences] = await db
      .select({
        contentBehavior: schema.userPreferences.contentBehavior,
        theme: schema.userPreferences.theme,
        language: schema.userPreferences.language,
      })
      .from(schema.userPreferences)
      .where(eq(schema.userPreferences.userId, userId));

    return preferences;
  },
  updateUserPreferences: async (
    userId: string,
    data: UpdateUserPreferencesReq
  ): Promise<UserPreferences | undefined> => {
    const [preferences] = await db
      .update(schema.userPreferences)
      .set(data)
      .where(eq(schema.userPreferences.userId, userId))
      .returning({
        contentBehavior: schema.userPreferences.contentBehavior,
        theme: schema.userPreferences.theme,
        language: schema.userPreferences.language,
      });

    return preferences;
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
    const [countResult] = await db
      //
      .select({ count: count() })
      .from(schema.users)
      .where(whereClause);

    const total = countResult?.count || 0;

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
  getUserWithProfile: async (id: string): Promise<User | undefined> => {
    return await db.query.users.findFirst({
      where: eq(schema.users.id, id),
      columns: {
        authUserId: false,
        createdAt: false,
        updatedAt: false,
      },
    });
  },
  createUser: async (data: CreateUserReq): Promise<User[]> => {
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
  updateUser: async (id: string, data: UpdateUserReq): Promise<User[]> => {
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
  deleteUser: async (id: string): Promise<User[]> => {
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
