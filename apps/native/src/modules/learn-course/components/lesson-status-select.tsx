import { ChevronDownIcon } from "lucide-react-native";
import { LessonProgressStatus } from "@repo/api-client";
import { useTranslation } from "@repo/i18n/native";
import { Button } from "@repo/ui-native/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@repo/ui-native/components/dropdown-menu";
import { Icon } from "@repo/ui-native/components/icon";
import { Text } from "@repo/ui-native/components/text";
import { PROGRESS_STATUS_LABEL_KEYS } from "@/utils/consts";
import { ProgressStatusIcon } from "./progress-status-icon";

const STATUSES = Object.values(LessonProgressStatus);

type LessonStatusSelectProps = {
  status: LessonProgressStatus;
  onStatusChange: (status: LessonProgressStatus) => void;
};

/** Lesson status dropdown: To do / In progress / Done. */
export function LessonStatusSelect({ status, onStatusChange }: LessonStatusSelectProps) {
  const { t } = useTranslation();

  function handleValueChange(value: string) {
    if (value !== status) {
      onStatusChange(value as LessonProgressStatus);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          accessibilityLabel={`${t("learn.progress.status")}: ${t(PROGRESS_STATUS_LABEL_KEYS[status])}`}
        >
          <ProgressStatusIcon status={status} />
          <Text>{t(PROGRESS_STATUS_LABEL_KEYS[status])}</Text>
          <Icon as={ChevronDownIcon} size={16} className="ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        <DropdownMenuLabel>{t("learn.progress.status")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={status} onValueChange={handleValueChange}>
          {STATUSES.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              <ProgressStatusIcon status={option} />
              <Text>{t(PROGRESS_STATUS_LABEL_KEYS[option])}</Text>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
