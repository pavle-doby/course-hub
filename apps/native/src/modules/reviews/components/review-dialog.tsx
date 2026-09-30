import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getGetCourseReviewsQueryKey,
  getGetMyCourseReviewQueryKey,
  getGetPublicCourseByPublicIdQueryKey,
  useGetMyCourseReview,
  useQueryClient,
  useSaveCourseReview,
} from "@repo/api-client";
import { SaveCourseReviewBodySchema, type SaveCourseReviewReq } from "@repo/contract";
import { useTranslation } from "@repo/i18n/native";
import { useErrorHandlingForm, useZodLocale } from "@repo/shared";
import { Button } from "@repo/ui-native/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui-native/components/dialog";
import { Field, FieldError, FieldGroup } from "@repo/ui-native/components/field";
import { toast } from "@repo/ui-native/components/sonner";
import { Text } from "@repo/ui-native/components/text";
import { FormRootError, FormTextarea } from "@/components/form";
import { useKeyboardHeight } from "@/modules/reviews/hooks/use-keyboard-height";
import { ReviewStars } from "./review-stars";

type ReviewDialogProps = {
  publicId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Create or edit the current user's review, prefilled with their saved one (web: `ReviewDialog`). */
export function ReviewDialog({ publicId, open, onOpenChange }: ReviewDialogProps) {
  const { t, i18n } = useTranslation();
  useZodLocale(i18n);
  const queryClient = useQueryClient();
  // The dialog is centered, so a bottom margin of the keyboard height lifts it above the keyboard.
  const keyboardHeight = useKeyboardHeight();

  const { data: myReview } = useGetMyCourseReview({ publicId }, { query: { enabled: open } });
  const { mutate, isPending } = useSaveCourseReview();

  const {
    control,
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
      <DialogContent style={{ marginBottom: keyboardHeight }}>
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
          <FormTextarea
            control={control}
            name="comment"
            label={t("learn.reviews.comment")}
            placeholder={t("learn.reviews.commentPlaceholder")}
            numberOfLines={4}
            className="min-h-24"
          />
          <FormRootError message={errors.root?.message} />
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">
              <Text>{t("learn.reviews.cancel")}</Text>
            </Button>
          </DialogClose>
          <Button disabled={isPending || !rating} onPress={handleSubmit(onSubmit)}>
            <Text>{isPending ? t("learn.reviews.saving") : t("learn.reviews.save")}</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
