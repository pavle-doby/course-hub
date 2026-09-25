import type { PublicQuizOrNullQuiz } from "@repo/api-client";

export type PublicQuiz = NonNullable<PublicQuizOrNullQuiz>;

export type PublicQuizQuestion = PublicQuiz["questions"][number];
