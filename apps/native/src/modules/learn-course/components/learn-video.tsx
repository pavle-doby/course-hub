import { AlertCircleIcon, Loader2Icon } from "lucide-react-native";
import type { LessonProgress } from "@repo/api-client";
import { useTranslation } from "@repo/i18n/native";
import { Alert, AlertTitle } from "@repo/ui-native/components/alert";
import { Skeleton } from "@repo/ui-native/components/skeleton";
import type { SaveLessonProgress } from "@/modules/learn-course/hooks/use-lesson-progress";
import type { useSelectionVideo } from "@/modules/learn-course/hooks/use-selection-video";
import { LessonVideoPlayer } from "./lesson-video-player";

type LearnVideoProps = {
  video: ReturnType<typeof useSelectionVideo>;
  lessonId?: string;
  progress?: LessonProgress;
  onSave: SaveLessonProgress;
};

/** Video slot of the reader: skeleton, player, or a processing / unavailable alert. */
export function LearnVideo({ video, lessonId, progress, onSave }: LearnVideoProps) {
  const { t } = useTranslation();

  if (video.isLoading) {
    return <Skeleton className="mt-4 aspect-video w-full rounded-lg" />;
  }

  if (video.isReady && video.video?.playbackUrl) {
    return (
      <LessonVideoPlayer
        key={video.video.id}
        playbackUrl={video.video.playbackUrl}
        lessonId={lessonId}
        progress={progress}
        onSave={onSave}
      />
    );
  }

  if (video.isProcessing) {
    return (
      <Alert className="mt-4" icon={Loader2Icon}>
        <AlertTitle>{t("learn.detail.videoProcessing")}</AlertTitle>
      </Alert>
    );
  }

  if (video.isError) {
    return (
      <Alert className="mt-4" variant="destructive" icon={AlertCircleIcon}>
        <AlertTitle>{t("learn.detail.videoUnavailable")}</AlertTitle>
      </Alert>
    );
  }

  return null;
}
