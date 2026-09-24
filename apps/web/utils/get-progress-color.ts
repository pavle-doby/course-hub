/** Text and progress-bar indicator colors for a completion percent (muted → blue → purple → green). */
export function getProgressColor(percent: number) {
  if (percent === 100) {
    return "text-green-600 dark:text-green-400 [&_[data-slot=progress-indicator]]:bg-green-500";
  }
  if (percent >= 66) {
    return "text-purple-600 dark:text-purple-400 [&_[data-slot=progress-indicator]]:bg-purple-500";
  }
  if (percent >= 33) {
    return "text-blue-600 dark:text-blue-400 [&_[data-slot=progress-indicator]]:bg-blue-500";
  }
  return "text-muted-foreground";
}
