import { db, schema } from "@repo/db";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { CourseInvitation, GetAllInvitationsRes, InvitationUser, Search } from "@repo/contract";
import { PaginationReqExtended } from "api/middleware/pagination";

const EXPIRY_DAYS = 7;

const acceptedByUser = alias(schema.users, "accepted_by_user");
const invitedUser = alias(schema.users, "invited_user");

function userColumns(table: typeof acceptedByUser | typeof invitedUser) {
  return {
    id: table.id,
    firstName: table.firstName,
    lastName: table.lastName,
    username: table.username,
    avatarUrl: table.avatarUrl,
    email: table.email,
  };
}

function getExpiresAt(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);
  return expiresAt;
}

export const invitationsRepository = {
  createEmailInvitation: async (
    courseId: string,
    invitedBy: string,
    email: string
  ): Promise<CourseInvitation> => {
    const [invitation] = await db
      .insert(schema.courseInvitations)
      .values({ courseId, invitedBy, type: "email", email, expiresAt: getExpiresAt() })
      .returning();
    return invitation!;
  },

  createLinkInvitation: async (courseId: string, invitedBy: string): Promise<CourseInvitation> => {
    const [invitation] = await db
      .insert(schema.courseInvitations)
      .values({ courseId, invitedBy, type: "link", expiresAt: getExpiresAt() })
      .returning();
    return invitation!;
  },

  getInvitationsByCourseId: async (
    courseId: string,
    { offset, limit, page, query }: PaginationReqExtended & Partial<Search>
  ): Promise<GetAllInvitationsRes> => {
    const searchCondition = query
      ? or(
          ilike(schema.courseInvitations.email, `%${query}%`),
          ilike(acceptedByUser.firstName, `%${query}%`),
          ilike(acceptedByUser.lastName, `%${query}%`),
          ilike(acceptedByUser.username, `%${query}%`),
          ilike(invitedUser.firstName, `%${query}%`),
          ilike(invitedUser.lastName, `%${query}%`),
          ilike(invitedUser.username, `%${query}%`)
        )
      : undefined;

    const whereClause = and(eq(schema.courseInvitations.courseId, courseId), searchCondition);

    const joinInvitedUser = and(
      eq(schema.courseInvitations.type, "email"),
      eq(schema.courseInvitations.email, invitedUser.email)
    );

    const [countResult] = await db
      .select({ count: count() })
      .from(schema.courseInvitations)
      .leftJoin(acceptedByUser, eq(schema.courseInvitations.acceptedByUserId, acceptedByUser.id))
      .leftJoin(invitedUser, joinInvitedUser)
      .where(whereClause);
    const total = countResult?.count ?? 0;

    const rows = await db
      .select({
        invitation: schema.courseInvitations,
        acceptedByUser: userColumns(acceptedByUser),
        invitedUser: userColumns(invitedUser),
      })
      .from(schema.courseInvitations)
      .leftJoin(acceptedByUser, eq(schema.courseInvitations.acceptedByUserId, acceptedByUser.id))
      .leftJoin(invitedUser, joinInvitedUser)
      .where(whereClause)
      .orderBy(desc(schema.courseInvitations.createdAt))
      .offset(offset ?? 0)
      .limit(limit ?? total);

    const data = rows.map((row) => ({
      ...row.invitation,
      acceptedByUser: row.acceptedByUser?.id ? (row.acceptedByUser as InvitationUser) : null,
      invitedUser: row.invitedUser?.id ? (row.invitedUser as InvitationUser) : null,
    }));

    return { data, pagination: { total, page, limit: limit || total } };
  },

  getInvitationById: async (id: string): Promise<CourseInvitation | undefined> => {
    return await db.query.courseInvitations.findFirst({
      where: eq(schema.courseInvitations.id, id),
    });
  },

  getInvitationByToken: async (token: string): Promise<CourseInvitation | undefined> => {
    return await db.query.courseInvitations.findFirst({
      where: eq(schema.courseInvitations.token, token),
    });
  },

  revokeInvitation: async (id: string): Promise<CourseInvitation | undefined> => {
    const [invitation] = await db
      .update(schema.courseInvitations)
      .set({ status: "revoked" })
      .where(
        and(eq(schema.courseInvitations.id, id), eq(schema.courseInvitations.status, "pending"))
      )
      .returning();
    return invitation;
  },

  acceptInvitation: async (id: string, userId: string): Promise<CourseInvitation> => {
    const [invitation] = await db
      .update(schema.courseInvitations)
      .set({ status: "accepted", acceptedAt: new Date(), acceptedByUserId: userId })
      .where(eq(schema.courseInvitations.id, id))
      .returning();
    return invitation!;
  },
};
