"use client";

import { useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, FileText, GripVertical, ImageIcon, Shuffle, Trash2, Upload } from "lucide-react";
import {
  getGetPublicDocumentsByParentQueryKey,
  useCompleteDocumentUpload,
  useDeleteDocument,
  useGetPublicDocumentsByParent,
  useInitializeDocumentUpload,
  useQueryClient,
  useReorderDocuments,
  type PublicDocument,
} from "@repo/api-client";
import type { ContentItemType } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingAction } from "@repo/shared";
import { Button } from "@repo/ui-web/components/button";
import { Skeleton } from "@repo/ui-web/components/skeleton";
import { toast } from "@repo/ui-web/components/sonner";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@repo/ui-web/components/attachment";
import { cn } from "@repo/ui-web/lib/utils";
import { ChAlertDialog } from "@/components/ch-alert-dialog";
import { uploadToR2 } from "@/utils/upload-to-r2";

type MediaParent = { type: ContentItemType; id?: string };

function SortableDocument({
  id,
  disabled,
  children,
}: {
  id: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-dragging={isDragging || undefined}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

function formatSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(bytes >= 1024 * 1024 ? 1 : 2)} MB`;
}

export function DocumentInput({ className, parent }: { className?: string; parent: MediaParent }) {
  const { t } = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [draftDocuments, setDraftDocuments] = useState<PublicDocument[] | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const queryClient = useQueryClient();
  const params = { parentType: parent.type, parentId: parent.id ?? "" };
  const queryKey = getGetPublicDocumentsByParentQueryKey(params);
  const { data: documents = [] } = useGetPublicDocumentsByParent(params, {
    query: { enabled: !!parent.id },
  });
  const displayedDocuments = draftDocuments ?? documents;
  const { mutateAsync: initializeUpload, isPending: isInitializing } =
    useInitializeDocumentUpload();
  const { mutateAsync: completeUpload } = useCompleteDocumentUpload();
  const { mutateAsync: deleteDocument, isPending: isDeleting } = useDeleteDocument();
  const { mutateAsync: reorderDocuments } = useReorderDocuments();
  const { handleErrorAction } = useErrorHandlingAction({
    t: t as (key: string) => string,
    showToastError: ({ title, description }) => toast.error(title, { description }),
  });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  async function uploadFile(file: File) {
    if (!parent.id) {
      return;
    }
    setUploadingFile(file.name);
    setUploadProgress(0);
    const upload = await initializeUpload({
      data: {
        parentType: parent.type,
        parentId: parent.id,
        fileName: file.name,
        mimeType: file.type as "image/jpeg" | "image/png" | "image/webp" | "application/pdf",
        size: file.size,
      },
    });
    await uploadToR2(
      upload.uploadUrl,
      file,
      upload.requiredHeaders["Content-Type"],
      setUploadProgress
    );
    await completeUpload({ pathParams: { id: upload.id } });
    await queryClient.invalidateQueries({ queryKey });
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    for (const file of files) {
      try {
        await uploadFile(file);
        toast.success(t("courses.editor.documentUploadComplete"));
      } catch (error) {
        handleErrorAction(error as Error);
      }
    }
    setUploadingFile(null);
    setUploadProgress(null);
  }

  async function handleDelete() {
    if (!deleteId) {
      return;
    }
    try {
      await deleteDocument({ pathParams: { id: deleteId } });
      await queryClient.invalidateQueries({ queryKey });
      toast.success(t("courses.editor.documentDeleted"));
      setDeleteId(null);
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!isReordering || !draftDocuments) {
      return;
    }
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = draftDocuments.findIndex((document) => document.id === active.id);
    const newIndex = draftDocuments.findIndex((document) => document.id === over.id);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }
    setDraftDocuments(arrayMove(draftDocuments, oldIndex, newIndex));
  }

  function handleStartReorder() {
    setDraftDocuments([...documents]);
    setIsReordering(true);
  }

  async function handleDoneReorder() {
    if (!parent.id || !draftDocuments) {
      return;
    }
    try {
      setIsSavingOrder(true);
      await reorderDocuments({
        pathParams: { parentType: parent.type, parentId: parent.id },
        data: { documentIds: draftDocuments.map((document) => document.id) },
      });
      await queryClient.invalidateQueries({ queryKey });
      toast.success(t("courses.editor.reorderSavedToast"));
    } catch (error) {
      handleErrorAction(error as Error);
    } finally {
      setDraftDocuments(null);
      setIsReordering(false);
      setIsSavingOrder(false);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        multiple
        onChange={(event) => void handleFileChange(event)}
      />
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <Button
          className="w-full"
          type="button"
          variant="outline"
          disabled={!parent.id || isInitializing || uploadingFile !== null || isReordering}
          onClick={() => inputRef.current?.click()}
        >
          <Upload />
          {t("courses.editor.uploadDocuments")}
        </Button>
        <Button
          className="w-full"
          type="button"
          variant="outline"
          disabled={
            displayedDocuments.length < 2 ||
            isSavingOrder ||
            isInitializing ||
            uploadingFile !== null
          }
          onClick={() => void (isReordering ? handleDoneReorder() : handleStartReorder())}
        >
          {isReordering ? <Check /> : <Shuffle />}
          {isReordering ? t("courses.editor.reorderDone") : t("courses.editor.reorder")}
        </Button>
      </div>

      {uploadingFile && (
        <div className="rounded-lg border bg-muted/40 p-3 text-sm">
          <div className="flex justify-between gap-3">
            <span className="truncate">{uploadingFile}</span>
            <span>{uploadProgress ?? 0}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-[width]"
              style={{ width: `${uploadProgress ?? 0}%` }}
            />
          </div>
        </div>
      )}

      {displayedDocuments.length ? (
        isSavingOrder ? (
          <div className="space-y-2">
            {displayedDocuments.map((document) => (
              <div key={document.id} className="flex items-center gap-2 rounded-xl border p-2">
                <Skeleton className="size-10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={displayedDocuments.map((document) => document.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {displayedDocuments.map((document) => {
                  const isImage = document.contentType.startsWith("image/");
                  return (
                    <SortableDocument key={document.id} id={document.id} disabled={!isReordering}>
                      <Attachment className="w-full">
                        <AttachmentMedia>{isImage ? <ImageIcon /> : <FileText />}</AttachmentMedia>
                        <AttachmentContent>
                          <AttachmentTitle>
                            <a href={document.publicUrl} target="_blank" rel="noreferrer">
                              {document.originalFileName}
                            </a>
                          </AttachmentTitle>
                          <AttachmentDescription>
                            {formatSize(document.sizeBytes)}
                          </AttachmentDescription>
                        </AttachmentContent>
                        <AttachmentActions>
                          {isReordering && (
                            <GripVertical className="size-4 cursor-grab text-muted-foreground" />
                          )}
                          {!isReordering && (
                            <AttachmentAction
                              type="button"
                              disabled={isDeleting}
                              onClick={() => setDeleteId(document.id)}
                            >
                              <Trash2 />
                            </AttachmentAction>
                          )}
                        </AttachmentActions>
                      </Attachment>
                    </SortableDocument>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )
      ) : !uploadingFile ? (
        <p className="text-sm text-muted-foreground">{t("courses.editor.documentsEmpty")}</p>
      ) : null}

      <ChAlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("courses.editor.documentDeleteDialog.title")}
        description={t("courses.editor.documentDeleteDialog.description")}
        cancelLabel={t("courses.editor.documentDeleteDialog.cancel")}
        actionLabel={t("courses.editor.documentDeleteDialog.confirm")}
        actionProps={{ variant: "destructive", onClick: () => void handleDelete() }}
      />
    </div>
  );
}
