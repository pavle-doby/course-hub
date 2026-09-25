"use client";

import { useId, useState } from "react";
import { ArrowUpDown, Check, ListChecks, Pencil, Plus, SaveIcon, Trash2 } from "lucide-react";
import {
  getGetPublicQuizQueryKey,
  getGetQuizQueryKey,
  useDeleteQuiz,
  useGenerateQuiz,
  useGetQuiz,
  useQueryClient,
  useSaveQuiz,
  type QuizQuestionsItem,
} from "@repo/api-client";
import type { QuizParentParams, SaveQuizReq } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingAction } from "@repo/shared";
import { Button } from "@repo/ui-web/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui-web/components/card";
import { Skeleton } from "@repo/ui-web/components/skeleton";
import { toast } from "@repo/ui-web/components/sonner";
import { ChAlertDialog } from "@/components/ch-alert-dialog";
import { QuizDialog } from "./quiz-dialog";
import { QuizForm } from "./quiz-form";
import { newQuestion, toFormValues } from "./quiz-form-values";

// Questions the inline form starts from; `version` remounts the form so a new AI draft replaces it
type Editor = { questions?: QuizQuestionsItem[]; isAi: boolean; version: number };

/** Quiz at the end of the selected course, topic or lesson: create, edit or delete it inline. */
export function QuizSection({ parent }: { parent: QuizParentParams }) {
  const { t } = useT();
  const formId = useId();
  const queryClient = useQueryClient();
  const { handleErrorAction } = useErrorHandlingAction({
    t: t as (key: string) => string,
    showToastError: ({ title, description }) => toast.error(title, { description }),
  });
  const [chooseDialogOpen, setChooseDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const { data, isLoading } = useGetQuiz(parent);
  const { mutate: generate, isPending: isGenerating } = useGenerateQuiz();
  const { mutateAsync: save, isPending: isSaving } = useSaveQuiz();
  const { mutate: deleteQuiz } = useDeleteQuiz();
  const quiz = data?.quiz;

  function handleOpenChooseDialog() {
    setChooseDialogOpen(true);
  }

  function handleOpenDeleteDialog() {
    setDeleteDialogOpen(true);
  }

  function handleToggleReorder() {
    setIsReordering((current) => !current);
  }

  function handleEdit() {
    setEditor({ questions: quiz?.questions, isAi: false, version: 0 });
  }

  function handleManualCreate() {
    setChooseDialogOpen(false);
    setEditor({ isAi: false, version: 0 });
  }

  function handleGenerate(instructions?: string) {
    generate(
      { pathParams: parent, data: { instructions } },
      {
        onSuccess: (draft) => {
          setChooseDialogOpen(false);
          setIsReordering(false);
          setEditor((current) => ({
            questions: draft.questions,
            isAi: true,
            version: (current?.version ?? 0) + 1,
          }));
        },
        onError: (error: unknown) => handleErrorAction(error as Error),
      }
    );
  }

  function handleCloseEditor() {
    setEditor(null);
    setIsReordering(false);
  }

  async function handleSave(questions: SaveQuizReq) {
    const saved = await save({ pathParams: parent, data: questions });
    queryClient.setQueryData(getGetQuizQueryKey(parent), { quiz: saved });
    void queryClient.invalidateQueries({ queryKey: getGetPublicQuizQueryKey(parent) });
    toast.success(t("courses.quiz.saved"));
    handleCloseEditor();
  }

  function handleDelete() {
    deleteQuiz(
      { pathParams: parent },
      {
        onSuccess: () => {
          queryClient.setQueryData(getGetQuizQueryKey(parent), { quiz: null });
          void queryClient.invalidateQueries({
            queryKey: getGetPublicQuizQueryKey(parent),
          });
          toast.success(t("courses.quiz.deleted"));
        },
        onError: (error: unknown) => handleErrorAction(error as Error),
      }
    );
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="size-4" />
          {t("courses.quiz.title")}
        </CardTitle>
        <CardDescription>
          {isLoading ? (
            <Skeleton className="h-4 w-40" />
          ) : editor ? (
            t("courses.quiz.formDescription")
          ) : quiz ? (
            t("courses.quiz.questionCount", { count: quiz.questions.length })
          ) : (
            t("courses.quiz.empty", {
              type: t(`courses.quiz.${parent.parentType}`),
            })
          )}
        </CardDescription>
        {editor && (
          <CardAction className="flex gap-2">
            <Button
              variant={isReordering ? "default" : "outline"}
              className="gap-1.5"
              aria-pressed={isReordering}
              disabled={isGenerating}
              onClick={handleToggleReorder}
            >
              {isReordering ? <Check /> : <ArrowUpDown />}
              {isReordering ? t("courses.quiz.reorderDone") : t("courses.quiz.reorder")}
            </Button>
            <Button
              type="submit"
              form={formId}
              className="gap-1.5"
              disabled={isSaving || isGenerating}
            >
              <SaveIcon />
              {isSaving ? t("courses.quiz.saving") : t("courses.quiz.save")}
            </Button>
          </CardAction>
        )}
        {!isLoading && !editor && quiz && (
          <CardAction className="flex gap-2">
            <Button variant="outline" className="gap-1.5" onClick={handleEdit}>
              <Pencil />
              {t("courses.quiz.edit")}
            </Button>
            <Button variant="outline" className="gap-1.5" onClick={handleOpenDeleteDialog}>
              <Trash2 />
              {t("courses.quiz.delete")}
            </Button>
          </CardAction>
        )}
      </CardHeader>

      {editor ? (
        <CardContent>
          <QuizForm
            key={editor.version}
            id={formId}
            defaultValues={
              editor.questions ? toFormValues(editor.questions) : { questions: [newQuestion()] }
            }
            isAiDraft={editor.isAi}
            isRegenerating={isGenerating}
            isReordering={isReordering}
            onRegenerate={handleGenerate}
            onCancel={handleCloseEditor}
            onSave={handleSave}
          />
        </CardContent>
      ) : (
        !isLoading &&
        !quiz && (
          <CardContent>
            <Button className="gap-1.5" onClick={handleOpenChooseDialog}>
              <Plus />
              {t("courses.quiz.create")}
            </Button>
          </CardContent>
        )
      )}

      <QuizDialog
        open={chooseDialogOpen}
        isGenerating={isGenerating}
        onOpenChange={setChooseDialogOpen}
        onAiCreate={handleGenerate}
        onManualCreate={handleManualCreate}
      />
      <ChAlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("courses.quiz.deleteDialog.title")}
        description={t("courses.quiz.deleteDialog.description")}
        cancelLabel={t("courses.quiz.deleteDialog.cancel")}
        actionLabel={t("courses.quiz.deleteDialog.confirm")}
        actionProps={{ variant: "destructive", onClick: handleDelete }}
      />
    </Card>
  );
}
