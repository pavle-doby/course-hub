import { ErrorCodeAi, TooManyRequestsError } from "@repo/contract";

// ponytail: in-memory, so it resets on deploy and isn't shared across instances — fine on one Railway instance
const usage = new Map<string, { day: string; count: number }>();

/** Counts one AI call for the user today; throws 429 once `dailyLimit` is used up. */
export function consumeAiUsage(userId: string, dailyLimit: number): void {
  const day = new Date().toISOString().slice(0, 10);
  const entry = usage.get(userId);
  const count = entry?.day === day ? entry.count : 0;
  if (count >= dailyLimit) {
    throw new TooManyRequestsError({ code: ErrorCodeAi.LIMIT_REACHED });
  }
  usage.set(userId, { day, count: count + 1 });
}
