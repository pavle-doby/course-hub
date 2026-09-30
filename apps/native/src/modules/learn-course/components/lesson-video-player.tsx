import { useVideoPlayer, VideoView } from "expo-video";
import type { LessonProgress } from "@repo/api-client";
import { useLessonVideoProgress, type SaveLessonProgress } from "@/modules/learn-course/hooks/use-lesson-progress";

type LessonVideoPlayerProps = {
  playbackUrl: string;
  /** Tracks progress for this lesson; omitted for course/topic videos and when not enrolled. */
  lessonId?: string;
  progress?: LessonProgress;
  onSave: SaveLessonProgress;
};

/** Ready video with native controls (web: `<video controls>` in `LearnWorkingArea`). */
export function LessonVideoPlayer({
  playbackUrl,
  lessonId,
  progress,
  onSave,
}: LessonVideoPlayerProps) {
  // `timeUpdate` every second, like the `<video>` `timeupdate` web saves from.
  const player = useVideoPlayer(playbackUrl, (videoPlayer) => {
    videoPlayer.timeUpdateEventInterval = 1;
  });
  useLessonVideoProgress(player, { lessonId, progress, onSave });

  return (
    <VideoView
      player={player}
      nativeControls
      fullscreenOptions={{ enable: true }}
      contentFit="contain"
      style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: 8, marginTop: 16 }}
    />
  );
}
