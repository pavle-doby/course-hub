import { useVideoPlayer, VideoView } from "expo-video";
import type { LessonProgress } from "@repo/api-client";
import {
  useLessonVideoProgress,
  type SaveLessonProgress,
} from "@/modules/learn-course/hooks/use-lesson-progress";

type LessonVideoPlayerProps = {
  playbackUrl: string;
  /** Tracks progress for this lesson; omitted for course/topic videos and when not enrolled. */
  lessonId?: string;
  progress?: LessonProgress;
  onSave: SaveLessonProgress;
  /** Reports the end of this topic video; omitted for lesson/course videos and when not enrolled. */
  topicId?: string;
  onTopicVideoWatched?: (topicId: string) => void;
};

/** Ready video with native controls (web: `<video controls>` in `LearnWorkingArea`). */
export function LessonVideoPlayer({
  playbackUrl,
  lessonId,
  progress,
  onSave,
  topicId,
  onTopicVideoWatched,
}: LessonVideoPlayerProps) {
  // `timeUpdate` every second, like the `<video>` `timeupdate` web saves from.
  const player = useVideoPlayer(playbackUrl, (videoPlayer) => {
    videoPlayer.timeUpdateEventInterval = 1;
  });
  useLessonVideoProgress(player, { lessonId, progress, onSave, topicId, onTopicVideoWatched });

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
