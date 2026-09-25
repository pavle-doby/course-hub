"use client";

import { useState } from "react";
import Image from "next/image";
import {
  AlertCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  Loader2Icon,
} from "lucide-react";
import type { CourseProgress, Lesson, LessonProgressStatus } from "@repo/api-client";
import {
  useGetPublicDocumentsByParent,
  useGetPublicVideoByParent,
  useGetVideoByParent,
} from "@repo/api-client";
import { Alert, AlertTitle } from "@repo/ui-web/components/alert";
import { Badge } from "@repo/ui-web/components/badge";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@repo/ui-web/components/attachment";
import { Button } from "@repo/ui-web/components/button";
import { Skeleton } from "@repo/ui-web/components/skeleton";
import { cn } from "@repo/ui-web/lib/utils";
import { useT } from "@repo/i18n/client";
import type { Selection, TopicWithLessons } from "@/hooks/use-course-tree";
import { useLessonVideoProgress, useSaveLessonProgress } from "@/hooks/use-lesson-progress";
import { NEXT_LESSON_STATUS, PROGRESS_STATUS_LABEL_KEYS } from "@/utils/consts";
import { getVideoRefetchInterval } from "@/utils/get-video-refetch-interval";
import { StarRating } from "@/components/star-rating";
import { LessonStatusSelect } from "./lesson-status-select";
import { LearnQuiz } from "./quiz/learn-quiz";
import { ProgressStatusIcon } from "./progress-status-icon";

type LearnWorkingAreaProps = {
  selection: Selection;
  course: {
    id: string;
    publicId: string;
    name: string;
    description?: string | null;
    thumbnailUrl?: string | null;
    ratingAverage: number;
    ratingCount: number;
  };
  tree: TopicWithLessons[];
  flatLessons: Lesson[];
  isEnrolled: boolean;
  progress?: CourseProgress;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function LearnWorkingArea({
  selection,
  course,
  tree,
  flatLessons,
  isEnrolled,
  progress,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: LearnWorkingAreaProps) {
  const { t } = useT();
  const saveLessonProgress = useSaveLessonProgress(course.publicId);
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  const selectedTopic =
    selection.type === "topic" ? tree.find((topic) => topic.id === selection.id) : undefined;
  const selectedLesson =
    selection.type === "lesson"
      ? flatLessons.find((lesson) => lesson.id === selection.id)
      : undefined;

  const name =
    selection.type === "course" ? course.name : (selectedTopic?.name ?? selectedLesson?.name);
  const description =
    selection.type === "course"
      ? course.description
      : (selectedTopic?.description ?? selectedLesson?.description);

  const parentByType = {
    topic: selectedTopic && { parentType: "topic" as const, parentId: selectedTopic.id },
    lesson: selectedLesson && { parentType: "lesson" as const, parentId: selectedLesson.id },
    course: { parentType: "course" as const, parentId: course.id },
  };
  const parent = parentByType[selection.type] ?? parentByType.course;

  const { data: video } = useGetVideoByParent(parent, {
    query: {
      enabled: isEnrolled,
      refetchInterval: (query) => {
        return getVideoRefetchInterval(query.state.data?.status);
      },
    },
  });
  const { data: publicVideo } = useGetPublicVideoByParent(
    { parentType: "course", parentId: course.id },
    {
      query: {
        enabled: !isEnrolled,
        refetchInterval: (query) => {
          return getVideoRefetchInterval(query.state.data?.status);
        },
      },
    }
  );
  const activeVideo = isEnrolled ? video : publicVideo;
  const hasVideo = Boolean(activeVideo);
  const isVideoReady = activeVideo?.status === "ready";
  const isVideoError = activeVideo?.status === "error";
  const isVideoProcessing = hasVideo && !isVideoReady && !isVideoError;
  const { data: documents = [] } = useGetPublicDocumentsByParent(parent);

  const lessonProgress = selectedLesson
    ? (progress?.lessons.find((lesson) => lesson.lessonId === selectedLesson.id) ?? {
        lessonId: selectedLesson.id,
        status: "todo" as const,
        progressSeconds: 0,
      })
    : undefined;
  const readOnlyStatus =
    selection.type === "course"
      ? progress?.status
      : progress?.topics.find((topic) => topic.topicId === selectedTopic?.id)?.status;
  const videoProgressHandlers = useLessonVideoProgress({
    lessonId: isEnrolled ? lessonProgress?.lessonId : undefined,
    progress: lessonProgress,
    onSave: saveLessonProgress,
  });

  const nextStatus =
    isEnrolled && lessonProgress ? NEXT_LESSON_STATUS[lessonProgress.status] : undefined;

  const isCompleteStep = nextStatus?.status === "done";

  function handleLessonStatusChange(status: LessonProgressStatus) {
    if (lessonProgress) {
      setIsSavingStatus(true);
      saveLessonProgress(lessonProgress.lessonId, { status }, () => setIsSavingStatus(false));
    }
  }

  function handleAdvanceStatus() {
    if (nextStatus) {
      handleLessonStatusChange(nextStatus.status);
    }
  }

  return (
    <div className={cn("flex flex-1 flex-col gap-6 p-4 md:p-6", nextStatus && "pb-16 md:pb-6")}>
      <div className="hidden items-center justify-center gap-2 md:flex">
        <Button
          className="min-w-30"
          variant="outline"
          size="sm"
          disabled={!hasPrevious}
          onClick={onPrevious}
        >
          <ChevronLeftIcon className="size-4" />
          {t("learn.detail.previous")}
        </Button>
        <Button
          className="min-w-30"
          variant="outline"
          size="sm"
          disabled={!hasNext}
          onClick={onNext}
        >
          {t("learn.detail.next")}
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      <div className="mx-auto w-full max-w-2xl">
        {selection.type === "course" && course.thumbnailUrl && (
          <Image
            src={course.thumbnailUrl}
            alt=""
            width={640}
            height={178}
            unoptimized
            className="mb-4 aspect-video w-full rounded-lg object-cover"
          />
        )}
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-2xl font-semibold">{name}</h2>
          {nextStatus && !isCompleteStep && (
            <Button
              className="ml-auto hidden shrink-0 md:flex"
              size="sm"
              disabled={isSavingStatus}
              onClick={handleAdvanceStatus}
            >
              {t(nextStatus.labelKey)}
            </Button>
          )}
          {isEnrolled && lessonProgress && isSavingStatus && (
            <Skeleton className="h-8 w-32 shrink-0" />
          )}
          {isEnrolled && lessonProgress && !isSavingStatus && (
            <LessonStatusSelect
              status={lessonProgress.status}
              onStatusChange={handleLessonStatusChange}
            />
          )}
          {isEnrolled && readOnlyStatus && (
            <Badge variant="outline" className="h-8 shrink-0 gap-2 px-3 text-sm">
              <ProgressStatusIcon status={readOnlyStatus} className="size-4!" />
              {t(PROGRESS_STATUS_LABEL_KEYS[readOnlyStatus])}
            </Badge>
          )}
        </div>
        {selection.type === "course" && (
          <StarRating className="mt-2" average={course.ratingAverage} count={course.ratingCount} />
        )}
        {hasVideo && (
          <>
            {isVideoReady && (
              <video
                key={activeVideo?.id}
                className="mt-4 aspect-video w-full rounded-lg bg-muted"
                controls
                src={activeVideo?.playbackUrl}
                {...videoProgressHandlers}
              />
            )}
            {isVideoProcessing && (
              <Alert className="mt-4">
                <Loader2Icon className="size-4 animate-spin" />
                <AlertTitle>{t("learn.detail.videoProcessing")}</AlertTitle>
              </Alert>
            )}
            {isVideoError && (
              <Alert className="mt-4" variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>{t("learn.detail.videoUnavailable")}</AlertTitle>
              </Alert>
            )}
          </>
        )}

        {documents.length > 0 && (
          <section className="mt-4">
            <h3 className="mb-2 font-medium">{t("learn.detail.documents")}</h3>
            <div className="space-y-2">
              {documents.map((document) => (
                <Attachment key={document.id} className="w-full">
                  <AttachmentMedia
                    variant={document.contentType.startsWith("image/") ? "image" : undefined}
                  >
                    {document.contentType.startsWith("image/") ? (
                      <Image
                        src={document.publicUrl}
                        alt={document.originalFileName}
                        fill
                        unoptimized
                      />
                    ) : (
                      <FileTextIcon />
                    )}
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle className="break-all whitespace-normal">
                      {document.originalFileName}
                    </AttachmentTitle>
                    <AttachmentDescription>{document.contentType}</AttachmentDescription>
                  </AttachmentContent>
                  <AttachmentTrigger asChild>
                    <a href={document.publicUrl} target="_blank" rel="noreferrer" />
                  </AttachmentTrigger>
                </Attachment>
              ))}
            </div>
          </section>
        )}

        <p className="mt-4 whitespace-pre-wrap text-muted-foreground">
          {description || t("learn.detail.noDescription")}
        </p>

        <LearnQuiz key={parent.parentId} parent={parent} isEnrolled={isEnrolled} />

        {nextStatus && (
          <>
            {/* Desktop: completing sits at the end of the lesson; starting sits next to the title */}
            {isCompleteStep && (
              <Button
                className="mt-6 hidden w-full md:flex"
                disabled={isSavingStatus}
                onClick={handleAdvanceStatus}
              >
                {t(nextStatus.labelKey)}
              </Button>
            )}
            {/* Mobile/tablet: fixed primary button above the bottom nav */}
            <div className="fixed inset-x-0 bottom-20 z-40 px-4 pb-2 md:hidden">
              <Button className="w-full" disabled={isSavingStatus} onClick={handleAdvanceStatus}>
                {t(nextStatus.labelKey)}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
