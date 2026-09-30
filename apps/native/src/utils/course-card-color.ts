// Same hash as web `courseCardGradient`; NativeWind has no gradients on native, so a solid color.
const COURSE_CARD_COLORS = ["bg-rose-500", "bg-indigo-500", "bg-teal-500", "bg-purple-500"];

export function courseCardColor(id: string) {
  let hash = 2166136261;
  for (const char of id) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  }
  hash ^= hash >>> 16;
  return COURSE_CARD_COLORS[(hash >>> 0) % COURSE_CARD_COLORS.length];
}
