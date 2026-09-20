"use client";

import Image from "next/image";
import { FileText, Trash2 } from "lucide-react";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentProgress,
  AttachmentTitle,
} from "@repo/ui-web/components/attachment";
import { Spinner } from "@repo/ui-web/components/spinner";
import { cn } from "@repo/ui-web/lib/utils";

type ChAttachmentState = "uploading" | "processing" | "error" | "done";

type ChAttachmentProps = {
  name: string;
  description?: React.ReactNode;
  state?: ChAttachmentState;
  progress?: number | null;
  src?: string;
  alt?: string;
  href?: string;
  icon?: React.ReactNode;
  onDelete?: () => void;
  deleteLabel?: string;
  deleteDisabled?: boolean;
  extraActions?: React.ReactNode;
  className?: string;
};

export function ChAttachment({
  name,
  description,
  state = "done",
  progress,
  src,
  alt = "",
  href,
  icon = <FileText />,
  onDelete,
  deleteLabel = "Delete",
  deleteDisabled,
  extraActions,
  className,
}: ChAttachmentProps) {
  const isBusy = state === "uploading" || state === "processing";
  const clampedProgress = progress == null ? null : Math.min(progress, 99);
  const title = href ? (
    <a href={href} target="_blank" rel="noreferrer">
      {name}
    </a>
  ) : (
    name
  );

  return (
    <div className={cn("w-full", className)}>
      <Attachment className="w-full" state={state}>
        <AttachmentMedia variant={src ? "image" : undefined}>
          {src ? <Image src={src} alt={alt} fill unoptimized /> : isBusy ? <Spinner /> : icon}
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>{title}</AttachmentTitle>
          {description && <AttachmentDescription>{description}</AttachmentDescription>}
        </AttachmentContent>
        {(onDelete || extraActions) && (
          <AttachmentActions>
            {extraActions}
            {onDelete && (
              <AttachmentAction
                type="button"
                disabled={deleteDisabled}
                onClick={onDelete}
                aria-label={deleteLabel}
              >
                <Trash2 />
              </AttachmentAction>
            )}
          </AttachmentActions>
        )}
        {isBusy && clampedProgress !== null && <AttachmentProgress value={clampedProgress} />}
      </Attachment>
    </div>
  );
}
