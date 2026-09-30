import { useState } from "react";
import { View } from "react-native";
import { ChevronLeftIcon, StarIcon } from "lucide-react-native";
import { useTranslation } from "@repo/i18n/native";
import { Button } from "@repo/ui-native/components/button";
import { Icon } from "@repo/ui-native/components/icon";
import { Progress } from "@repo/ui-native/components/progress";
import { Skeleton } from "@repo/ui-native/components/skeleton";
import { Text } from "@repo/ui-native/components/text";
import { cn } from "@repo/ui-native/lib/utils";
import { ChAlertDialog } from "@/modules/learn-course/components/ch-alert-dialog";
import { getProgressColor } from "@/utils/get-progress-color";

type LearnHeaderProps = {
  title: string;
  onBack: () => void;
  isEnrolled: boolean;
  isEnrolling: boolean;
  onEnroll: () => void;
  isWithdrawing: boolean;
  onWithdraw: () => void;
  /** Shows the Review button (enrolled only). */
  onReview?: () => void;
  isLoadingEnrollment?: boolean;
  /** Percent of lessons done; omitted when not enrolled. */
  progressPercent?: number;
};

/** Reader header: back + title, enroll or review/withdraw actions, and the course progress bar. */
export function LearnHeader({
  title,
  onBack,
  isEnrolled,
  isEnrolling,
  onEnroll,
  isWithdrawing,
  onWithdraw,
  onReview,
  isLoadingEnrollment = false,
  progressPercent,
}: LearnHeaderProps) {
  const { t } = useTranslation();
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const progressColor = progressPercent !== undefined && getProgressColor(progressPercent);

  function handleOpenWithdrawDialog() {
    setWithdrawDialogOpen(true);
  }

  return (
    <View className="gap-2 border-b border-border bg-background px-2 py-2">
      <View className="flex-row items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onPress={onBack}
          accessibilityLabel={t("learn.detail.back")}
        >
          <Icon as={ChevronLeftIcon} size={20} />
        </Button>
        <Text className="flex-1 text-lg font-bold" numberOfLines={1}>
          {title}
        </Text>

        {isLoadingEnrollment ? (
          <Skeleton className="h-9 w-24" />
        ) : isEnrolled ? (
          <View className="flex-row gap-2">
            {onReview && (
              <Button
                variant="outline"
                size="icon"
                onPress={onReview}
                accessibilityLabel={t("learn.reviews.review")}
              >
                <Icon as={StarIcon} size={16} />
              </Button>
            )}
            <Button variant="outline" disabled={isWithdrawing} onPress={handleOpenWithdrawDialog}>
              <Text>
                {isWithdrawing ? t("learn.detail.withdrawing") : t("learn.detail.withdraw")}
              </Text>
            </Button>
          </View>
        ) : (
          <Button onPress={onEnroll} disabled={isEnrolling}>
            <Text>{isEnrolling ? t("learn.detail.enrolling") : t("learn.detail.enroll")}</Text>
          </Button>
        )}
      </View>

      {progressColor && (
        <View
          className="flex-row items-center gap-2 px-2"
          accessible
          accessibilityLabel={t("learn.progress.courseProgress")}
        >
          <Progress
            value={progressPercent}
            className="flex-1"
            indicatorClassName={progressColor.indicator}
          />
          <Text className={cn("text-sm font-bold tabular-nums", progressColor.text)}>
            {progressPercent}%
          </Text>
        </View>
      )}

      <ChAlertDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        title={t("learn.detail.withdrawDialog.title")}
        description={t("learn.detail.withdrawDialog.description")}
        cancelLabel={t("learn.detail.withdrawDialog.cancel")}
        actionLabel={t("learn.detail.withdrawDialog.confirm")}
        actionVariant="destructive"
        onAction={onWithdraw}
      />
    </View>
  );
}
