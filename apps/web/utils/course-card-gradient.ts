const COURSE_CARD_GRADIENTS = [
  "from-orange-400 to-rose-500",
  "from-blue-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-fuchsia-400 to-purple-500",
];

export function courseCardGradient(id: string) {
  let hash = 2166136261;
  for (const char of id) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  }
  hash ^= hash >>> 16;
  return COURSE_CARD_GRADIENTS[(hash >>> 0) % COURSE_CARD_GRADIENTS.length];
}
