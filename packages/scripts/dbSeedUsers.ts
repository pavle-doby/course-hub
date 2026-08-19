import { client, db, schema } from "@repo/db";
import { inArray } from "drizzle-orm";

const mockUsers: Array<typeof schema.users.$inferInsert> = [
  {
    email: "default@email.com",
    firstName: "Default",
    lastName: "User",
    role: "user",
    status: "approved",
  },
  {
    email: "admin.mock@email.com",
    firstName: "Admin",
    lastName: "Mock",
    role: "admin",
    status: "approved",
  },
  {
    email: "reviewer.mock@email.com",
    firstName: "Reviewer",
    lastName: "Mock",
    role: "user",
    status: "pending",
  },
];

const mockEmails = mockUsers.map((user) => user.email);

async function seedUsers() {
  try {
    const insertedUsers = await db
      .insert(schema.users)
      .values(mockUsers)
      .onConflictDoNothing({ target: schema.users.email })
      .returning({
        id: schema.users.id,
        email: schema.users.email,
        role: schema.users.role,
        status: schema.users.status,
      });

    const usersInDb = await db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        role: schema.users.role,
        status: schema.users.status,
      })
      .from(schema.users)
      .where(inArray(schema.users.email, mockEmails));

    console.log(`Inserted ${insertedUsers.length} mock user(s).`);
    console.table(usersInDb);
  } catch (error) {
    console.error("Failed to populate mock users:", error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

seedUsers();
