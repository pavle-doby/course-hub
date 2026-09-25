"use client";

import { useId } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, SaveIcon, XIcon } from "lucide-react";
import {
  getGetCourseReviewsQueryKey,
  getGetMyCourseReviewQueryKey,
  getGetPublicCourseByPublicIdQueryKey,
  useGetMyCourseReview,
  useQueryClient,
  useSaveCourseReview,
} from "@repo/api-client";
import { SaveCourseReviewBodySchema, type SaveCourseReviewReq } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingForm, useZodLocale } from "@repo/shared";
import { Alert, AlertTitle } from "@repo/ui-web/components/alert";
import { Button } from "@repo/ui-web/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui-web/components/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui-web/components/field";
import { toast } from "@repo/ui-web/components/sonner";
import { Textarea } from "@repo/ui-web/components/textarea";
import { ReviewStars } from "./review-stars";

type ReviewDialogProps = {
  publicId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Create or edit the current user's review; prefilled with their saved review. */
export function ReviewDialog({ publicId, open, onOpenChange }: ReviewDialogProps) {
  const id = useId();
  const { t, i18n } = useT();
  useZodLocale(i18n);
  const queryClient = useQueryClient();

  const { data: myReview } = useGetMyCourseReview({ publicId }, { query: { enabled: open } });
  const { mutate, isPending } = useSaveCourseReview();

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SaveCourseReviewReq>({
    resolver: zodResolver(SaveCourseReviewBodySchema),
    values: myReview?.review
      ? { rating: myReview.review.rating, comment: myReview.review.comment ?? "" }
      : undefined,
  });
  const rating = useWatch({ control, name: "rating" });
  const { handleErrorForm } = useErrorHandlingForm<SaveCourseReviewReq>({ t, i18n, setError });

  function onSubmit(data: SaveCourseReviewReq) {
    mutate(
      { pathParams: { publicId }, data },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: getGetMyCourseReviewQueryKey({ publicId }),
          });
          void queryClient.invalidateQueries({
            queryKey: getGetPublicCourseByPublicIdQueryKey({ publicId }),
          });
          void queryClient.invalidateQueries({
            queryKey: getGetCourseReviewsQueryKey({ publicId }),
          });
          toast.success(t("learn.reviews.saved"));
          onOpenChange(false);
        },
        onError: (error: unknown) => handleErrorForm(error as Error),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{t("learn.reviews.dialogTitle")}</DialogTitle>
            <DialogDescription>{t("learn.reviews.dialogDescription")}</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Controller
                control={control}
                name="rating"
                render={({ field }) => (
                  <ReviewStars
                    className="justify-center"
                    rating={field.value}
                    onRatingChange={field.onChange}
                  />
                )}
              />
              <FieldError errors={[errors.rating]} />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${id}-comment`}>{t("learn.reviews.comment")}</FieldLabel>
              <Textarea
                id={`${id}-comment`}
                rows={4}
                placeholder={t("learn.reviews.commentPlaceholder")}
                {...register("comment")}
              />
              <FieldError errors={[errors.comment]} />
            </Field>
            {errors.root && (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>{errors.root.message}</AlertTitle>
              </Alert>
            )}
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                <XIcon />
                {t("learn.reviews.cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending || !rating}>
              <SaveIcon />
              {isPending ? t("learn.reviews.saving") : t("learn.reviews.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
