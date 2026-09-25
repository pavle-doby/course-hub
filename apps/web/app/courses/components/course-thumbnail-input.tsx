"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  getGetCourseByPublicIdQueryKey,
  useCompleteCourseThumbnailUpload,
  useDeleteCourseThumbnail,
  useInitializeCourseThumbnailUpload,
  useQueryClient,
} from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingAction } from "@repo/shared";
import { Button } from "@repo/ui-web/components/button";
import { Field, FieldLabel } from "@repo/ui-web/components/field";
import { toast } from "@repo/ui-web/components/sonner";
import { ImageIcon, Trash2Icon } from "lucide-react";
import { ChAttachment } from "@/components/ch-attachment";
import { uploadToR2 } from "@/utils/upload-to-r2";

type CourseThumbnailInputProps = {
  courseId?: string;
  publicId?: string;
  thumbnailUrl?: string | null;
};

export function CourseThumbnailInput({
  courseId,
  publicId,
  thumbnailUrl,
}: CourseThumbnailInputProps) {
  const { t } = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedThumbnailUrl, setUploadedThumbnailUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { mutateAsync: initializeUpload } = useInitializeCourseThumbnailUpload();
  const { mutateAsync: completeUpload } = useCompleteCourseThumbnailUpload();
  const { mutateAsync: deleteThumbnail, isPending: isDeleting } = useDeleteCourseThumbnail();
  const { handleErrorAction } = useErrorHandlingAction({
    t: t as (key: string) => string,
    showToastError: ({ title, description }) => toast.error(title, { description }),
  });

  async function refreshCourse() {
    if (publicId) {
      await queryClient.invalidateQueries({
        queryKey: getGetCourseByPublicIdQueryKey({ publicId }),
      });
    }
  }

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !courseId) {
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      const upload = await initializeUpload({
        data: {
          courseId,
          mimeType: file.type as "image/jpeg" | "image/png" | "image/webp",
          size: file.size,
        },
      });
      await uploadToR2(
        upload.uploadUrl,
        file,
        upload.requiredHeaders["Content-Type"],
        setUploadProgress
      );
      await completeUpload({ data: { courseId, objectKey: upload.objectKey } });
      setUploadedThumbnailUrl(URL.createObjectURL(file));
      await refreshCourse();
      toast.success(t("courses.editor.thumbnailUploaded"));
    } catch (error) {
      handleErrorAction(error as Error);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }

  async function handleDelete() {
    if (!courseId) {
      return;
    }
    try {
      await deleteThumbnail({ pathParams: { id: courseId } });
      setUploadedThumbnailUrl(null);
      await refreshCourse();
      toast.success(t("courses.editor.thumbnailDeleted"));
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  const displayedThumbnailUrl = thumbnailUrl ?? uploadedThumbnailUrl;

  return (
    <Field>
      <FieldLabel>{t("courses.editor.thumbnailLabel")}</FieldLabel>
      {isUploading ? (
        <ChAttachment
          name={t("courses.editor.uploadThumbnail")}
          state="uploading"
          progress={uploadProgress}
          icon={<ImageIcon />}
        />
      ) : displayedThumbnailUrl ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
          <Image src={displayedThumbnailUrl} alt="" fill unoptimized className="object-cover" />
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center gap-2 rounded-lg border border-dashed border-input text-sm text-muted-foreground">
          <ImageIcon className="size-4" />
          {t("courses.editor.thumbnailPlaceholder")}
        </div>
      )}
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => void handleChange(event)}
      />
      <div className="flex flex-col gap-2 md:flex-row">
        <Button
          type="button"
          variant="outline"
          className="w-full md:flex-1"
          disabled={!courseId || isUploading || isDeleting}
          onClick={() => inputRef.current?.click()}
        >
          <ImageIcon />
          {t("courses.editor.uploadThumbnail")}
        </Button>
        {displayedThumbnailUrl && !isUploading && (
          <Button
            type="button"
            variant="outline"
            className="w-full md:flex-1"
            disabled={isDeleting}
            onClick={() => void handleDelete()}
          >
            <Trash2Icon />
            {t("courses.editor.deleteThumbnail")}
          </Button>
        )}
      </div>
    </Field>
  );
}
