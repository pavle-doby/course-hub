"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Trash2, Upload, Video } from "lucide-react";
import {
  getGetPublicDocumentsByParentQueryKey,
  getGetVideoByParentQueryKey,
  useCompleteDocumentUpload,
  useCompleteVideoUpload,
  useDeleteVideo,
  useGetPublicDocumentsByParent,
  useGetVideoByParent,
  useInitializeDocumentUpload,
  useInitializeVideoUpload,
  useQueryClient,
} from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import type { ContentItemType } from "@repo/contract";
import { useErrorHandlingAction } from "@repo/shared";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@repo/ui-web/components/attachment";
import { Button } from "@repo/ui-web/components/button";
import { toast } from "@repo/ui-web/components/sonner";
import { Spinner } from "@repo/ui-web/components/spinner";
import { cn } from "@repo/ui-web/lib/utils";
import { ChAlertDialog } from "@/components/ch-alert-dialog";
import { uploadToCloudflare } from "@/utils/upload-to-cloudflare";
import { uploadToR2 } from "@/utils/upload-to-r2";
import { getVideoRefetchInterval } from "@/utils/get-video-refetch-interval";

type MediaParent = { type: ContentItemType; id?: string };

export function MediaInput({ className, parent }: { className?: string; parent: MediaParent }) {
  const { t } = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const queryKey = getGetVideoByParentQueryKey({
    parentType: parent.type,
    parentId: parent.id ?? "",
  });
  const documentParams = { parentType: parent.type, parentId: parent.id ?? "" };
  const documentQueryKey = getGetPublicDocumentsByParentQueryKey(documentParams);
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
  const { data: documents = [] } = useGetPublicDocumentsByParent(documentParams, {
    query: { enabled: !!parent.id },
  });
  const { mutateAsync: initializeUpload, isPending: isInitializing } = useInitializeVideoUpload();
  const { mutateAsync: completeUpload } = useCompleteVideoUpload();
  const { mutateAsync: initializeImageUpload, isPending: isInitializingImage } =
    useInitializeDocumentUpload();
  const { mutateAsync: completeImageUpload } = useCompleteDocumentUpload();
  const { mutateAsync: deleteVideo, isPending: isDeleting } = useDeleteVideo();
  const attachmentState =
    isUploading || video?.status === "uploading"
      ? "uploading"
      : video?.status === "error"
        ? "error"
        : "processing";
  const rawProgress =
    attachmentState === "uploading" ? uploadProgress : Math.round(video?.processingProgress ?? 0);
  const progress = rawProgress === null ? null : Math.min(rawProgress, 99);
  const imageDocuments = documents.filter((document) => document.contentType.startsWith("image/"));
  const imageDocument = imageDocuments[0];

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

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !parent.id) {
      return;
    }

    try {
      setIsImageUploading(true);
      const upload = await initializeImageUpload({
        data: {
          parentType: parent.type,
          parentId: parent.id,
          fileName: file.name,
          mimeType: file.type as "image/jpeg" | "image/png" | "image/webp",
          size: file.size,
        },
      });
      await uploadToR2(upload.uploadUrl, file, upload.requiredHeaders["Content-Type"], () => {});
      await completeImageUpload({ pathParams: { id: upload.id } });
      await queryClient.invalidateQueries({ queryKey: documentQueryKey });
      toast.success(t("courses.editor.documentUploadComplete"));
    } catch (error) {
      handleErrorAction(error as Error);
    } finally {
      setIsImageUploading(false);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      {video?.status === "ready" ? (
        <video
          className="aspect-video w-full rounded-lg bg-muted"
          controls
          src={video.playbackUrl}
        />
      ) : video || isUploading ? (
        <Attachment className="w-full" state={attachmentState}>
          <AttachmentMedia>
            {attachmentState === "uploading" || attachmentState === "processing" ? (
              <Spinner />
            ) : (
              <Video />
            )}
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{video?.name ?? t("courses.editor.uploadVideo")}</AttachmentTitle>
            <AttachmentDescription>
              {video?.status === "error"
                ? t("courses.editor.videoFailed")
                : isUploading || video?.status === "uploading"
                  ? t("courses.editor.videoUploading")
                  : t("courses.editor.videoProcessing")}
            </AttachmentDescription>
            {(attachmentState === "uploading" || attachmentState === "processing") &&
              progress !== null && (
                <div className="mt-2 space-y-1">
                  <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="flex h-full items-center justify-end rounded-full bg-primary transition-[width] duration-300"
                      style={{ width: `${progress}%` }}
                    >
                      <span className="mx-0.5 text-xs font-bold text-primary-foreground">
                        {progress}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
          </AttachmentContent>
        </Attachment>
      ) : imageDocument ? (
        <a
          className="relative block aspect-video overflow-hidden rounded-lg border bg-muted"
          href={imageDocument.publicUrl}
          target="_blank"
          rel="noreferrer"
        >
          <Image
            fill
            unoptimized
            sizes="100vw"
            className="object-cover"
            src={imageDocument.publicUrl}
            alt={imageDocument.originalFileName}
          />
        </a>
      ) : (
        <div className="flex h-32 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-input text-sm text-muted-foreground">
          <Video className="size-4" />
          {video ? t("courses.editor.videoProcessing") : t("courses.editor.mediaPlaceholder")}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <input
          ref={imageInputRef}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => void handleImageChange(event)}
        />
        <Button
          className="w-full"
          type="button"
          variant="outline"
          disabled={!parent.id || isInitializingImage || isImageUploading}
          onClick={() => imageInputRef.current?.click()}
        >
          <ImageIcon />
          {t("courses.editor.uploadImage")}
        </Button>
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept="video/*"
          onChange={(event) => void handleFileChange(event)}
        />
        {video ? (
          <Button
            className="w-full"
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 />
            {t("courses.editor.deleteVideo")}
          </Button>
        ) : (
          <Button
            className="w-full"
            type="button"
            variant="outline"
            disabled={!parent.id || isInitializing || isUploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload />
            {t("courses.editor.uploadVideo")}
          </Button>
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
