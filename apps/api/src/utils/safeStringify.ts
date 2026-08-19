/**
 * Tries to safely stringify the provided data as JSON.
 * If stringification fails, it returns `null` instead of throwing an error.
 */
export function safeStringify(data: unknown): string | null {
  try {
    return JSON.stringify(data);
  } catch (_error) {
    return null;
  }
}
