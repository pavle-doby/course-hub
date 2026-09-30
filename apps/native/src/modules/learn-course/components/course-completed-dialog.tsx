import { useEffect, useEffectEvent } from "react";
import { router } from "expo-router";
import { StarIcon } from "lucide-react-native";
import { useTranslation } from "@repo/i18n/native";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui-native/components/alert-dialog";
import { buttonTextVariants, buttonVariants } from "@repo/ui-native/components/button";
import { Icon } from "@repo/ui-native/components/icon";
import { Text } from "@repo/ui-native/components/text";
import { useCelebrate } from "@/modules/learn-course/hooks/use-celebrate";
import { FIREWORK_INTERVAL } from "@/utils/consts";

type CourseCompletedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Set while the learner has no review yet; swaps "Thank you" for a Review button. */
  onReview?: () => void;
};

/**
 * Congratulations for a just-finished course (web: `CourseCompletedDialog`): a big burst when it
 * opens, then soft fireworks while it stays open.
 */
export function CourseCompletedDialog({
  open,
  onOpenChange,
  onReview,
}: CourseCompletedDialogProps) {
  const { t } = useTranslation();
  const { celebrateCourse, firework } = useCelebrate();
  const onCelebrateCourse = useEffectEvent(celebrateCourse);
  const onFirework = useEffectEvent(firework);

  useEffect(() => {
    if (!open) {
      return;
    }
    onCelebrateCourse();
    let tick = 0;
    const interval = setInterval(() => onFirework(tick++), FIREWORK_INTERVAL);
    return () => clearInterval(interval);
  }, [open]);

  function handleNewCourse() {
    router.push("/learn");
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("learn.completed.title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("learn.completed.description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {onReview ? (
            <>
              {/* AlertDialogAction sets the default button text class, so the variant's goes on the Text */}
              <AlertDialogAction
                className={buttonVariants({ variant: "outline" })}
                onPress={handleNewCourse}
              >
                <Text className={buttonTextVariants({ variant: "outline" })}>
                  {t("learn.completed.newCourse")}
                </Text>
              </AlertDialogAction>
              <AlertDialogAction onPress={onReview}>
                <Icon as={StarIcon} size={16} />
                <Text>{t("learn.reviews.review")}</Text>
              </AlertDialogAction>
            </>
          ) : (
            <>
              <AlertDialogCancel>
                <Text>{t("learn.completed.thankYou")}</Text>
              </AlertDialogCancel>
              <AlertDialogAction onPress={handleNewCourse}>
                <Text>{t("learn.completed.newCourse")}</Text>
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
