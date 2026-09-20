const COURSE_CARD_GRADIENTS = [
  "from-orange-500 to-rose-600",
  "from-blue-600 to-indigo-700",
  "from-emerald-500 to-teal-700",
  "from-fuchsia-600 to-purple-700",
];

export function courseCardGradient(id: string) {
  let hash = 2166136261;
  for (const char of id) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  }
  hash ^= hash >>> 16;
  return COURSE_CARD_GRADIENTS[(hash >>> 0) % COURSE_CARD_GRADIENTS.length];
}
