import { client, db, schema } from "@repo/db";

async function cleanUsers() {
  try {
    const deletedUsers = await db.delete(schema.users).returning({
      id: schema.users.id,
    });

    console.log(`Deleted ${deletedUsers.length} user(s).`);
  } catch (error) {
    console.error("Failed to clean users:", error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

cleanUsers();
