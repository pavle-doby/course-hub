/** Text and progress-bar indicator colors for a completion percent (muted → blue → purple → green). */
export function getProgressColor(percent: number): { text: string; indicator?: string } {
  if (percent === 100) {
    return { text: "text-green-600 dark:text-green-400", indicator: "bg-green-500" };
  }
  if (percent >= 66) {
    return { text: "text-purple-600 dark:text-purple-400", indicator: "bg-purple-500" };
  }
  if (percent >= 33) {
    return { text: "text-blue-600 dark:text-blue-400", indicator: "bg-blue-500" };
  }
  return { text: "text-muted-foreground" };
}
