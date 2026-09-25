"use client";

import { useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, SaveIcon, XIcon } from "lucide-react";
import { getGetCourseReviewsQueryKey, useQueryClient, useSaveReviewReply } from "@repo/api-client";
import { SaveReviewReplyBodySchema, type SaveReviewReplyReq } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingForm, useZodLocale } from "@repo/shared";
import { Alert, AlertTitle } from "@repo/ui-web/components/alert";
import { Button } from "@repo/ui-web/components/button";
import { Field, FieldError, FieldLabel } from "@repo/ui-web/components/field";
import { Textarea } from "@repo/ui-web/components/textarea";

type ReviewReplyFormProps = {
  publicId: string;
  reviewId: string;
  reply: string | null;
  onDone: () => void;
};

/** Course creator's inline form to write, edit, or remove their reply to a review. */
export function ReviewReplyForm({ publicId, reviewId, reply, onDone }: ReviewReplyFormProps) {
  const id = useId();
  const { t, i18n } = useT();
  useZodLocale(i18n);
  const queryClient = useQueryClient();
  const { mutate, isPending } = useSaveReviewReply();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SaveReviewReplyReq>({
    resolver: zodResolver(SaveReviewReplyBodySchema),
    defaultValues: { reply: reply ?? "" },
  });
  const { handleErrorForm } = useErrorHandlingForm<SaveReviewReplyReq>({ t, i18n, setError });

  function save(data: SaveReviewReplyReq) {
    mutate(
      { pathParams: { reviewId }, data },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: getGetCourseReviewsQueryKey({ publicId }),
          });
          onDone();
        },
        onError: (error: unknown) => handleErrorForm(error as Error),
      }
    );
  }

  return (
    <form onSubmit={handleSubmit(save)} noValidate className="flex flex-col gap-2">
      <Field>
        <FieldLabel htmlFor={`${id}-reply`} className="sr-only">
          {t("learn.reviews.reply")}
        </FieldLabel>
        <Textarea
          id={`${id}-reply`}
          rows={3}
          autoFocus
          placeholder={t("learn.reviews.replyPlaceholder")}
          {...register("reply")}
        />
        <FieldError errors={[errors.reply]} />
      </Field>
      {errors.root && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>{errors.root.message}</AlertTitle>
        </Alert>
      )}
      <div className="flex justify-end gap-2">
        {reply && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mr-auto text-destructive"
            disabled={isPending}
            onClick={() => save({ reply: null })}
          >
            {t("learn.reviews.deleteReply")}
          </Button>
        )}
        <Button type="button" variant="outline" size="sm" onClick={onDone}>
          <XIcon />
          {t("learn.reviews.cancel")}
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          <SaveIcon />
          {isPending ? t("learn.reviews.saving") : t("learn.reviews.saveReply")}
        </Button>
      </div>
    </form>
  );
}
