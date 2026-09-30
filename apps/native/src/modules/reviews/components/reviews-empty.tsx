import { useTranslation } from "@repo/i18n/native";
import { Button } from "@repo/ui-native/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui-native/components/card";
import { Text } from "@repo/ui-native/components/text";

type ReviewsEmptyProps = {
  /** Shown to enrolled learners: opens the review dialog. */
  onWriteReview?: () => void;
};

/** No reviews yet, with a "write the first review" action for enrolled learners. */
export function ReviewsEmpty({ onWriteReview }: ReviewsEmptyProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle className="text-center">{t("learn.reviews.empty")}</CardTitle>
        <CardDescription className="text-center">
          {t("learn.reviews.emptyDescription")}
        </CardDescription>
      </CardHeader>
      {onWriteReview && (
        <CardFooter className="justify-center border-t border-border pt-4">
          <Button onPress={onWriteReview}>
            <Text>{t("learn.reviews.writeFirst")}</Text>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
