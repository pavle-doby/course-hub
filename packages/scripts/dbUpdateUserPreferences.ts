import { client, db, schema } from "@repo/db";
import { eq, isNull } from "drizzle-orm";

async function updateUserPreferences(): Promise<void> {
  try {
    const usersWithoutPreferences = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .leftJoin(schema.userPreferences, eq(schema.users.id, schema.userPreferences.userId))
      .where(isNull(schema.userPreferences.userId));

    const preferences: Array<typeof schema.userPreferences.$inferInsert> =
      usersWithoutPreferences.map(({ id: userId }) => ({ userId, language: "en", theme: "dark" }));

    const created =
      usersWithoutPreferences.length > 0
        ? await db
            .insert(schema.userPreferences)
            .values(preferences)
            .onConflictDoNothing({ target: schema.userPreferences.userId })
            .returning({ userId: schema.userPreferences.userId })
        : [];

    const updated = await db
      .update(schema.userPreferences)
      .set({ theme: "dark", updatedAt: new Date() })
      .where(eq(schema.userPreferences.theme, "system"))
      .returning({ userId: schema.userPreferences.userId });

    console.log(`Created preferences for ${created.length} user(s).`);
    console.log(`Updated ${updated.length} user(s) from system to dark theme.`);
  } catch (error) {
    console.error("Failed to update user preferences:", error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

updateUserPreferences();
