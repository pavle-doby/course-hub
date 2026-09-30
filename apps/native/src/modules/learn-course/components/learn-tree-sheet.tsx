import { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChevronRightIcon,
  FileIcon,
  FilesIcon,
  FolderIcon,
  MessageSquareTextIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react-native";
import type { LessonProgressStatus } from "@repo/api-client";
import { useTranslation } from "@repo/i18n/native";
import { Button } from "@repo/ui-native/components/button";
import { Icon } from "@repo/ui-native/components/icon";
import { Skeleton } from "@repo/ui-native/components/skeleton";
import { Text } from "@repo/ui-native/components/text";
import { cn } from "@repo/ui-native/lib/utils";
import type { Selection, TopicWithLessons } from "@/modules/learn-course/hooks/use-course-tree";
import { ProgressStatusIcon } from "./progress-status-icon";

type LearnTreeSheetProps = {
  open: boolean;
  onClose: () => void;
  courseName: string;
  tree: TopicWithLessons[];
  selection: Selection;
  contentLocked: boolean;
  isLoadingTree?: boolean;
  courseStatus?: LessonProgressStatus;
  /** Topic and lesson status by id; empty when not enrolled. */
  statusById: Map<string, LessonProgressStatus>;
  onSelect: (selection: Selection) => void;
  onOpenReviews: () => void;
};

// shown while topics/lessons load after enrolling
const PLACEHOLDER_ROWS = Array.from({ length: 6 }, (_, i) => i);

/** Course contents (web: the reader sidebar), as a page sheet. Selecting an item closes it. */
export function LearnTreeSheet({
  open,
  onClose,
  courseName,
  tree,
  selection,
  contentLocked,
  isLoadingTree = false,
  courseStatus,
  statusById,
  onSelect,
  onOpenReviews,
}: LearnTreeSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [collapsedTopicIds, setCollapsedTopicIds] = useState<Set<string>>(new Set());

  function handleSelect(next: Selection) {
    onSelect(next);
    onClose();
  }

  function handleOpenReviews() {
    onClose();
    onOpenReviews();
  }

  function handleToggleTopic(topicId: string) {
    setCollapsedTopicIds((current) => {
      const next = new Set(current);
      if (!next.delete(topicId)) {
        next.add(topicId);
      }
      return next;
    });
  }

  function isSelected(type: Selection["type"], id?: string) {
    return (
      selection.type === type && (type === "course" || ("id" in selection && selection.id === id))
    );
  }

  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background">
        <View className="flex-row items-center justify-between border-b border-border px-4 py-2">
          <Text className="text-lg font-semibold">{t("learn.detail.contents")}</Text>
          <Button
            variant="ghost"
            size="icon"
            onPress={onClose}
            accessibilityLabel={t("learn.detail.closeContents")}
          >
            <Icon as={XIcon} size={20} />
          </Button>
        </View>

        <ScrollView contentContainerStyle={{ padding: 8, paddingBottom: insets.bottom + 16 }}>
          <TreeRow
            icon={MessageSquareTextIcon}
            label={t("learn.reviews.title")}
            isActive={false}
            onPress={handleOpenReviews}
          />
          <View className="my-1 h-px bg-border" />
          <TreeRow
            icon={FolderIcon}
            label={courseName}
            isActive={isSelected("course")}
            status={courseStatus}
            onPress={() => handleSelect({ type: "course" })}
          />

          {isLoadingTree
            ? PLACEHOLDER_ROWS.map((i) => <Skeleton key={i} className="mx-2 my-1 h-8" />)
            : tree.map((topic) => {
                const isCollapsed = collapsedTopicIds.has(topic.id);
                return (
                  <View key={topic.id}>
                    <View className="flex-row items-center">
                      <Pressable
                        className="h-10 w-8 items-center justify-center"
                        accessibilityRole="button"
                        accessibilityLabel={t("courses.editor.toggleTopic")}
                        accessibilityState={{ expanded: !isCollapsed }}
                        onPress={() => handleToggleTopic(topic.id)}
                      >
                        <Icon
                          as={ChevronRightIcon}
                          size={16}
                          className="text-muted-foreground"
                          style={{ transform: [{ rotate: isCollapsed ? "0deg" : "90deg" }] }}
                        />
                      </Pressable>
                      <View className="flex-1">
                        <TreeRow
                          icon={FilesIcon}
                          label={topic.name}
                          isActive={isSelected("topic", topic.id)}
                          disabled={contentLocked}
                          status={statusById.get(topic.id)}
                          onPress={() => handleSelect({ type: "topic", id: topic.id })}
                        />
                      </View>
                    </View>
                    {!isCollapsed && (
                      <View className="ml-8 border-l border-border pl-2">
                        {topic.lessons.map((lesson) => (
                          <TreeRow
                            key={lesson.id}
                            icon={FileIcon}
                            label={lesson.name}
                            isActive={isSelected("lesson", lesson.id)}
                            disabled={contentLocked}
                            status={statusById.get(lesson.id)}
                            onPress={() => handleSelect({ type: "lesson", id: lesson.id })}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
        </ScrollView>
      </View>
    </Modal>
  );
}

type TreeRowProps = {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  disabled?: boolean;
  status?: LessonProgressStatus;
  onPress: () => void;
};

function TreeRow({ icon, label, isActive, disabled, status, onPress }: TreeRowProps) {
  return (
    <Pressable
      className={cn(
        "min-h-10 flex-row items-center gap-2 rounded-md px-2 py-2 active:bg-accent",
        isActive && "bg-accent",
        disabled && "opacity-50"
      )}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive, disabled }}
      disabled={disabled}
      onPress={onPress}
    >
      <Icon as={icon} size={16} />
      <Text className={cn("flex-1 text-sm", isActive && "font-medium")}>{label}</Text>
      {status && <ProgressStatusIcon status={status} />}
    </Pressable>
  );
}
