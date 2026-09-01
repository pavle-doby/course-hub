import { client, db, schema } from "@repo/db";
import { eq } from "drizzle-orm";

// --- Configure target user ---
const TARGET_USER_EMAIL = "iampavle.test+3@gmail.com";

type MockCourse = Omit<typeof schema.courses.$inferInsert, "creatorId"> & {
  topics: Array<
    Omit<typeof schema.topics.$inferInsert, "courseId"> & {
      lessons: Array<Omit<typeof schema.lessons.$inferInsert, "topicId">>;
    }
  >;
};

const NEW_COURSE_INFO: Array<{ name: string; description: string }> = [
  {
    name: "Python for Data Analysis",
    description: "Learn pandas, NumPy, and data wrangling with Python.",
  },
  {
    name: "SQL Fundamentals",
    description: "Query relational databases with confidence using SQL.",
  },
  {
    name: "Git & GitHub Essentials",
    description: "Version control workflows for solo and team projects.",
  },
  {
    name: "Docker for Developers",
    description: "Containerize applications and streamline local dev environments.",
  },
  {
    name: "Next.js in Depth",
    description: "Build full-stack React applications with the App Router.",
  },
  {
    name: "Tailwind CSS Mastery",
    description: "Design fast, responsive UIs with utility-first CSS.",
  },
  { name: "GraphQL Fundamentals", description: "Design and consume GraphQL APIs from scratch." },
  {
    name: "PostgreSQL for Developers",
    description: "Schema design, indexing, and query performance in Postgres.",
  },
  {
    name: "AWS Cloud Practitioner",
    description: "Core AWS services and cloud architecture fundamentals.",
  },
  {
    name: "CI/CD with GitHub Actions",
    description: "Automate testing and deployments for modern applications.",
  },
  {
    name: "Testing JavaScript Applications",
    description: "Unit, integration, and e2e testing strategies for JS apps.",
  },
  {
    name: "Vue.js Crash Course",
    description: "Build reactive UIs with Vue 3 and the Composition API.",
  },
  { name: "Swift & iOS Development", description: "Build native iOS apps with Swift and SwiftUI." },
  { name: "Kotlin for Android", description: "Modern Android app development with Kotlin." },
  {
    name: "Machine Learning Basics",
    description: "Core ML concepts, models, and evaluation techniques.",
  },
  {
    name: "Data Structures & Algorithms",
    description: "Classic CS fundamentals for interviews and everyday coding.",
  },
  {
    name: "System Design Interview Prep",
    description: "Design scalable systems and ace system design interviews.",
  },
  {
    name: "Rust Programming Basics",
    description: "Memory safety and performance with the Rust language.",
  },
  {
    name: "Go for Backend Services",
    description: "Build fast, concurrent backend services with Go.",
  },
  {
    name: "Web Security Fundamentals",
    description: "Common vulnerabilities and how to defend against them.",
  },
  {
    name: "REST API Design Best Practices",
    description: "Design clean, versioned, and predictable REST APIs.",
  },
  {
    name: "Redis for Caching & Queues",
    description: "Speed up applications with caching, pub/sub, and queues.",
  },
  {
    name: "Figma for Developers",
    description: "Read designs and hand off implementation-ready specs.",
  },
  {
    name: "Agile & Scrum Fundamentals",
    description: "Sprint planning, standups, and delivering iteratively.",
  },
];

// Generates a consistent 2-topic / 3-lesson-per-topic outline for a course.
function buildTopics(courseName: string): MockCourse["topics"] {
  return [
    {
      name: `${courseName} Basics`,
      description: `Foundational concepts of ${courseName}.`,
      position: 1,
      lessons: [
        {
          name: "Overview & Setup",
          description: "Environment setup and first steps.",
          position: 1,
        },
        {
          name: "Core Concepts",
          description: "The building blocks you'll use everywhere.",
          position: 2,
        },
        {
          name: "Hands-on Exercise",
          description: "Apply what you've learned in a small project.",
          position: 3,
        },
      ],
    },
    {
      name: `${courseName} in Practice`,
      description: `Applying ${courseName} to real-world scenarios.`,
      position: 2,
      lessons: [
        {
          name: "Common Patterns",
          description: "Idiomatic approaches and conventions.",
          position: 1,
        },
        { name: "Troubleshooting", description: "Debugging common issues.", position: 2 },
        { name: "Next Steps", description: "Where to go from here.", position: 3 },
      ],
    },
  ];
}

const mockCourses: MockCourse[] = NEW_COURSE_INFO.map(({ name, description }) => ({
  name,
  description,
  status: "published",
  topics: buildTopics(name),
}));

async function addCourseContent() {
  try {
    const [user] = await db
      .select({ id: schema.users.id, email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.email, TARGET_USER_EMAIL))
      .limit(1);

    if (!user) {
      throw new Error(`User not found: ${TARGET_USER_EMAIL}`);
    }

    console.log(`Adding course content for user: ${user.email} (${user.id})\n`);

    for (const { topics, ...courseData } of mockCourses) {
      const [course] = await db
        .insert(schema.courses)
        .values({ ...courseData, creatorId: user.id })
        .onConflictDoNothing({ target: schema.courses.id })
        .returning({ id: schema.courses.id, name: schema.courses.name });

      const courseId = course?.id ?? courseData.id;

      if (!courseId) throw new Error(`Failed to resolve course id for: ${courseData.name}`);

      const wasInserted = !!course;
      console.log(`${wasInserted ? "Created" : "Skipped (exists)"} course: "${courseData.name}"`);

      for (const { lessons, ...topicData } of topics) {
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

        for (const lectureData of lessons) {
          const [lecture] = await db
            .insert(schema.lessons)
            .values({ ...lectureData, topicId })
            .onConflictDoNothing()
            .returning({ id: schema.lessons.id, name: schema.lessons.name });

          console.log(`    ${lecture ? "+" : "~"} Lecture: "${lectureData.name}"`);
        }
      }

      console.log("");
    }

    console.log("Done adding course content.");
  } catch (error) {
    console.error("Failed to add course content:", error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

addCourseContent();
