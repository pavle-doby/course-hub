"use client";

import Image from "next/image";
import { AlertCircle, ChevronLeft, ChevronRight, FileText, Loader2 } from "lucide-react";
import type { Lesson } from "@repo/api-client";
import {
  useGetPublicDocumentsByParent,
  useGetPublicVideoByParent,
  useGetVideoByParent,
} from "@repo/api-client";
import { Alert, AlertTitle } from "@repo/ui-web/components/alert";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@repo/ui-web/components/attachment";
import { Button } from "@repo/ui-web/components/button";
import { useT } from "@repo/i18n/client";
import type { Selection, TopicWithLessons } from "@/hooks/use-course-tree";
import { getVideoRefetchInterval } from "@/utils/get-video-refetch-interval";

type LearnWorkingAreaProps = {
  selection: Selection;
  course: { id: string; name: string; description?: string | null; thumbnailUrl?: string | null };
  tree: TopicWithLessons[];
  flatLessons: Lesson[];
  isEnrolled: boolean;
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
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: LearnWorkingAreaProps) {
  const { t } = useT();

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

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="hidden items-center justify-center gap-2 md:flex">
        <Button
          className="min-w-30"
          variant="outline"
          size="sm"
          disabled={!hasPrevious}
          onClick={onPrevious}
        >
          <ChevronLeft className="size-4" />
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
          <ChevronRight className="size-4" />
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
        <h2 className="text-2xl font-semibold">{name}</h2>
        {hasVideo && (
          <>
            {isVideoReady && (
              <video
                className="mt-4 aspect-video w-full rounded-lg bg-muted"
                controls
                src={activeVideo?.playbackUrl}
              />
            )}
            {isVideoProcessing && (
              <Alert className="mt-4">
                <Loader2 className="size-4 animate-spin" />
                <AlertTitle>{t("learn.detail.videoProcessing")}</AlertTitle>
              </Alert>
            )}
            {isVideoError && (
              <Alert className="mt-4" variant="destructive">
                <AlertCircle />
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
                      <FileText />
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
      </div>
    </div>
  );
}
