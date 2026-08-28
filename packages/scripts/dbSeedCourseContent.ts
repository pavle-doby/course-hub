import { client, db, schema } from "@repo/db";
import { eq } from "drizzle-orm";

// --- Configure target user ---
const TARGET_USER_EMAIL = "iampavle.test+3@gmail.com";

const mockCourses: Array<
  Omit<typeof schema.courses.$inferInsert, "creatorId"> & {
    topics: Array<
      Omit<typeof schema.topics.$inferInsert, "courseId"> & {
        lectures: Array<Omit<typeof schema.lectures.$inferInsert, "topicId">>;
      }
    >;
  }
> = [
  {
    name: "TypeScript Fundamentals",
    slug: "typescript-fundamentals",
    description: "A comprehensive introduction to TypeScript from the ground up.",
    status: "published",
    topics: [
      {
        name: "Getting Started",
        description: "Installation, compiler setup, and your first TS file.",
        position: 1,
        lectures: [
          { name: "What is TypeScript?", description: "Overview and motivation.", position: 1 },
          { name: "Installing the Compiler", description: "tsc setup via npm.", position: 2 },
          {
            name: "Hello World in TypeScript",
            description: "First compiled program.",
            position: 3,
          },
        ],
      },
      {
        name: "Core Types",
        description: "Primitives, arrays, tuples, enums, and any.",
        position: 2,
        lectures: [
          { name: "Primitive Types", description: "string, number, boolean.", position: 1 },
          { name: "Arrays & Tuples", description: "Typed collections.", position: 2 },
          { name: "Enums", description: "Numeric and string enums.", position: 3 },
        ],
      },
      {
        name: "Interfaces & Types",
        description: "Structural typing with interfaces and type aliases.",
        position: 3,
        lectures: [
          { name: "Interfaces", description: "Defining object shapes.", position: 1 },
          { name: "Type Aliases", description: "Reusable type expressions.", position: 2 },
          { name: "Union & Intersection Types", description: "Combining types.", position: 3 },
        ],
      },
    ],
  },
  {
    name: "React for Beginners",
    slug: "react-for-beginners",
    description: "Learn React from scratch — components, hooks, and state management.",
    status: "published",
    topics: [
      {
        name: "React Basics",
        description: "JSX, components, and props.",
        position: 1,
        lectures: [
          {
            name: "Introduction to React",
            description: "What React is and why it exists.",
            position: 1,
          },
          {
            name: "Your First Component",
            description: "Function components and JSX.",
            position: 2,
          },
          { name: "Props", description: "Passing data between components.", position: 3 },
        ],
      },
      {
        name: "State & Events",
        description: "Managing UI state and handling user interactions.",
        position: 2,
        lectures: [
          { name: "useState Hook", description: "Local component state.", position: 1 },
          { name: "Handling Events", description: "onClick, onChange, and friends.", position: 2 },
          {
            name: "Conditional Rendering",
            description: "Rendering different UI based on state.",
            position: 3,
          },
        ],
      },
    ],
  },
  {
    name: "Node.js & Express API Design",
    slug: "nodejs-express-api-design",
    description: "Build production-ready REST APIs with Node.js and Express.",
    status: "draft",
    topics: [
      {
        name: "Express Fundamentals",
        description: "Routing, middleware, and request/response cycle.",
        position: 1,
        lectures: [
          {
            name: "Setting Up Express",
            description: "Project scaffold and server bootstrap.",
            position: 1,
          },
          { name: "Routing", description: "GET, POST, PUT, DELETE handlers.", position: 2 },
          { name: "Middleware", description: "Writing and composing middleware.", position: 3 },
        ],
      },
      {
        name: "Data Validation",
        description: "Validating request payloads with Zod.",
        position: 2,
        lectures: [
          { name: "Why Validate?", description: "Security and reliability.", position: 1 },
          { name: "Zod Schemas", description: "Defining and parsing schemas.", position: 2 },
        ],
      },
    ],
  },
];

async function seedCourseContent() {
  try {
    const [user] = await db
      .select({ id: schema.users.id, email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.email, TARGET_USER_EMAIL))
      .limit(1);

    if (!user) {
      throw new Error(`User not found: ${TARGET_USER_EMAIL}`);
    }

    console.log(`Seeding course content for user: ${user.email} (${user.id})\n`);

    for (const { topics, ...courseData } of mockCourses) {
      const [course] = await db
        .insert(schema.courses)
        .values({ ...courseData, creatorId: user.id })
        .onConflictDoNothing({ target: schema.courses.slug })
        .returning({ id: schema.courses.id, name: schema.courses.name, slug: schema.courses.slug });

      const courseId =
        course?.id ??
        (
          await db
            .select({ id: schema.courses.id })
            .from(schema.courses)
            .where(eq(schema.courses.slug, courseData.slug))
            .limit(1)
        )[0]?.id;

      if (!courseId) throw new Error(`Failed to resolve course id for slug: ${courseData.slug}`);

      const wasInserted = !!course;
      console.log(`${wasInserted ? "Created" : "Skipped (exists)"} course: "${courseData.name}"`);

      for (const { lectures, ...topicData } of topics) {
        const [topic] = await db
          .insert(schema.topics)
          .values({ ...topicData, courseId })
          .onConflictDoNothing()
          .returning({ id: schema.topics.id, name: schema.topics.name });

        const topicId =
          topic?.id ??
          (
            await db
              .select({ id: schema.topics.id })
              .from(schema.topics)
              .where(eq(schema.topics.name, topicData.name))
              .limit(1)
          )[0]?.id;

        if (!topicId) throw new Error(`Failed to resolve topic id for: ${topicData.name}`);

        console.log(`  ${topic ? "+" : "~"} Topic: "${topicData.name}"`);

        for (const lectureData of lectures) {
          const [lecture] = await db
            .insert(schema.lectures)
            .values({ ...lectureData, topicId })
            .onConflictDoNothing()
            .returning({ id: schema.lectures.id, name: schema.lectures.name });

          console.log(`    ${lecture ? "+" : "~"} Lecture: "${lectureData.name}"`);
        }
      }

      console.log("");
    }

    console.log("Done seeding course content.");
  } catch (error) {
    console.error("Failed to seed course content:", error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

seedCourseContent();
