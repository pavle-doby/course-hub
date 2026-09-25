"use client";

import { useRef, useState } from "react";
import { RefreshCwIcon, Trash2Icon, UploadIcon, VideoIcon } from "lucide-react";
import {
  getGetVideoByParentQueryKey,
  useCompleteVideoUpload,
  useDeleteVideo,
  useGetVideoByParent,
  useInitializeVideoUpload,
  useQueryClient,
} from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import type { ContentItemType } from "@repo/contract";
import { useErrorHandlingAction } from "@repo/shared";
import { Button } from "@repo/ui-web/components/button";
import { toast } from "@repo/ui-web/components/sonner";
import { cn } from "@repo/ui-web/lib/utils";
import { ChAlertDialog } from "@/components/ch-alert-dialog";
import { ChAttachment } from "@/components/ch-attachment";
import { uploadToCloudflare } from "@/utils/upload-to-cloudflare";
import { getVideoRefetchInterval } from "@/utils/get-video-refetch-interval";

type MediaParent = { type: ContentItemType; id?: string };

export function MediaInput({ className, parent }: { className?: string; parent: MediaParent }) {
  const { t } = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const queryKey = getGetVideoByParentQueryKey({
    parentType: parent.type,
    parentId: parent.id ?? "",
  });
  const { handleErrorAction } = useErrorHandlingAction({
    t: t as (key: string) => string,
    showToastError: ({ title, description }) => toast.error(title, { description }),
  });
  const { data: video } = useGetVideoByParent(
    { parentType: parent.type, parentId: parent.id ?? "" },
    {
      query: {
        enabled: !!parent.id,
        refetchInterval: (query) => {
          return getVideoRefetchInterval(query.state.data?.status);
        },
      },
    }
  );
  const { mutateAsync: initializeUpload, isPending: isInitializing } = useInitializeVideoUpload();
  const { mutateAsync: completeUpload } = useCompleteVideoUpload();
  const { mutateAsync: deleteVideo, isPending: isDeleting } = useDeleteVideo();
  const isUploadingVideo = isUploading || video?.status === "uploading";
  const isFailed = video?.status === "error";
  const isReady = video?.status === "ready";
  const hasVideo = Boolean(video);
  const pickerDisabled = !parent.id || isInitializing || isUploading;
  const attachmentState = isUploadingVideo ? "uploading" : isFailed ? "error" : "processing";
  const rawProgress =
    attachmentState === "uploading" ? uploadProgress : Math.round(video?.processingProgress ?? 0);
  const progress = rawProgress === null ? null : Math.min(rawProgress, 99);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !parent.id) {
      return;
    }

    try {
      setIsUploading(true);
      const upload = await initializeUpload({
        data: {
          parentType: parent.type,
          parentId: parent.id,
          fileName: file.name,
          mimeType: file.type || "video/mp4",
          size: file.size,
          maxDurationSeconds: 14400,
        },
      });
      await queryClient.invalidateQueries({ queryKey });
      await uploadToCloudflare(upload.uploadUrl, file, setUploadProgress);
      await completeUpload({ pathParams: { id: upload.id } });

      await queryClient.invalidateQueries({ queryKey });
      toast.success(t("courses.editor.videoUploadSent"), {
        description: t("courses.editor.videoUploadProcessingDescription"),
      });
    } catch (error) {
      handleErrorAction(error as Error);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }

  async function handleDelete() {
    if (!video) {
      return;
    }

    try {
      await deleteVideo({ pathParams: { id: video.id } });
      await queryClient.invalidateQueries({ queryKey });
      setDeleteDialogOpen(false);
      toast.success(t("courses.editor.videoDeleted"));
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      {isReady ? (
        <video
          className="aspect-video w-full rounded-lg bg-muted"
          controls
          src={video.playbackUrl}
        />
      ) : hasVideo || isUploading ? (
        <ChAttachment
          name={video?.name ?? t("courses.editor.uploadVideo")}
          description={
            isFailed
              ? t("courses.editor.videoFailed")
              : isUploadingVideo
                ? t("courses.editor.videoUploading")
                : t("courses.editor.videoProcessing")
          }
          state={attachmentState}
          progress={progress}
          icon={<VideoIcon />}
          onDelete={() => setDeleteDialogOpen(true)}
          deleteLabel={t("courses.editor.deleteVideo")}
          deleteDisabled={isDeleting}
        />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center gap-2 rounded-lg border border-dashed border-input text-sm text-muted-foreground">
          <VideoIcon className="size-4" />
          {t("courses.editor.mediaPlaceholder")}
        </div>
      )}

      <div>
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept="video/*"
          onChange={(event) => void handleFileChange(event)}
        />
        {!hasVideo ? (
          <Button
            className="w-full"
            type="button"
            variant="outline"
            disabled={pickerDisabled}
            onClick={() => inputRef.current?.click()}
          >
            <UploadIcon />
            {t("courses.editor.uploadVideo")}
          </Button>
        ) : (
          isReady && (
            <div className="flex gap-2">
              <Button
                className="flex-1"
                type="button"
                variant="outline"
                disabled={pickerDisabled}
                onClick={() => inputRef.current?.click()}
              >
                <RefreshCwIcon />
                {t("courses.editor.updateVideo")}
              </Button>
              <Button
                className="flex-1"
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2Icon />
                {t("courses.editor.deleteVideo")}
              </Button>
            </div>
          )
        )}
      </div>
      <ChAlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("courses.editor.videoDeleteDialog.title")}
        description={t("courses.editor.videoDeleteDialog.description")}
        cancelLabel={t("courses.editor.videoDeleteDialog.cancel")}
        actionLabel={t("courses.editor.videoDeleteDialog.confirm")}
        actionProps={{ variant: "destructive", onClick: () => void handleDelete() }}
      />
    </div>
  );
}
