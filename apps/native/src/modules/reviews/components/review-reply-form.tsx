import { View } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getGetCourseReviewsQueryKey, useQueryClient, useSaveReviewReply } from "@repo/api-client";
import { SaveReviewReplyBodySchema, type SaveReviewReplyReq } from "@repo/contract";
import { useTranslation } from "@repo/i18n/native";
import { useErrorHandlingForm, useZodLocale } from "@repo/shared";
import { Button } from "@repo/ui-native/components/button";
import { Text } from "@repo/ui-native/components/text";
import { FormRootError, FormTextarea } from "@/components/form";

type ReviewReplyFormProps = {
  publicId: string;
  reviewId: string;
  reply: string | null;
  onDone: () => void;
};

/** Course creator's inline form to write, edit, or remove their reply (web: `ReviewReplyForm`). */
export function ReviewReplyForm({ publicId, reviewId, reply, onDone }: ReviewReplyFormProps) {
  const { t, i18n } = useTranslation();
  useZodLocale(i18n);
  const queryClient = useQueryClient();
  const { mutate, isPending } = useSaveReviewReply();

  const {
    control,
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
    <View className="mt-2 gap-2">
      <FormTextarea
        control={control}
        name="reply"
        label={t("learn.reviews.reply")}
        hideLabel
        autoFocus
        placeholder={t("learn.reviews.replyPlaceholder")}
        numberOfLines={3}
      />
      <FormRootError message={errors.root?.message} />
      <View className="flex-row justify-end gap-2">
        {reply && (
          <Button
            variant="ghost"
            size="sm"
            className="mr-auto"
            disabled={isPending}
            onPress={() => save({ reply: null })}
          >
            <Text className="text-destructive">{t("learn.reviews.deleteReply")}</Text>
          </Button>
        )}
        <Button variant="outline" size="sm" onPress={onDone}>
          <Text>{t("learn.reviews.cancel")}</Text>
        </Button>
        <Button size="sm" disabled={isPending} onPress={handleSubmit(save)}>
          <Text>{isPending ? t("learn.reviews.saving") : t("learn.reviews.saveReply")}</Text>
        </Button>
      </View>
    </View>
  );
}
