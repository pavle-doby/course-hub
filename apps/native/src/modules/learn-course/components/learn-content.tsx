import { View } from "react-native";
import { Image } from "expo-image";
import {
  getGetCourseProgressQueryKey,
  useGetPublicDocumentsByParent,
  useQueryClient,
  type CourseProgress,
  type Lesson,
} from "@repo/api-client";
import { useTranslation } from "@repo/i18n/native";
import { Skeleton } from "@repo/ui-native/components/skeleton";
import { Text } from "@repo/ui-native/components/text";
import { StarRating } from "@/components/star-rating";
import type { Selection, TopicWithLessons } from "@/modules/learn-course/hooks/use-course-tree";
import { useSaveLessonProgress } from "@/modules/learn-course/hooks/use-lesson-progress";
import { useSelectionVideo } from "@/modules/learn-course/hooks/use-selection-video";
import { LearnDocuments } from "./learn-documents";
import { LearnStatus } from "./learn-status";
import { LearnVideo } from "./learn-video";
import { LearnQuiz } from "./quiz/learn-quiz";

type LearnContentProps = {
  selection: Selection;
  course: {
    id: string;
    publicId: string;
    name: string;
    description?: string | null;
    thumbnailUrl?: string | null;
    ratingAverage: number;
    ratingCount: number;
  };
  tree: TopicWithLessons[];
  flatLessons: Lesson[];
  isEnrolled: boolean;
  /** Present only when enrolled. */
  progress?: CourseProgress;
};

/** Selected course / topic / lesson: title, status, video, documents, description and quiz (web: `LearnWorkingArea`). */
export function LearnContent({
  selection,
  course,
  tree,
  flatLessons,
  isEnrolled,
  progress,
}: LearnContentProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { publicId } = course;
  const saveLessonProgress = useSaveLessonProgress(publicId);

  const selectedTopic =
    selection.type === "topic" ? tree.find((topic) => topic.id === selection.id) : undefined;
  const selectedLesson =
    selection.type === "lesson"
      ? flatLessons.find((lesson) => lesson.id === selection.id)
      : undefined;

  const name =
    selection.type === "course" ? course.name : (selectedTopic?.name ?? selectedLesson?.name);
  const description =
    selection.type === "course"
      ? course.description
      : (selectedTopic?.description ?? selectedLesson?.description);

  const parentByType = {
    topic: selectedTopic && { parentType: "topic" as const, parentId: selectedTopic.id },
    lesson: selectedLesson && { parentType: "lesson" as const, parentId: selectedLesson.id },
    course: { parentType: "course" as const, parentId: course.id },
  };
  const parent = parentByType[selection.type] ?? parentByType.course;

  const video = useSelectionVideo(parent, course.id, isEnrolled);
  const { data: documents = [], isLoading: isDocumentsLoading } =
    useGetPublicDocumentsByParent(parent);

  const lessonProgress = selectedLesson
    ? (progress?.lessons.find((lesson) => lesson.lessonId === selectedLesson.id) ?? {
        lessonId: selectedLesson.id,
        status: "todo" as const,
        progressSeconds: 0,
      })
    : undefined;

  // Answering a lesson quiz starts the lesson, like playing its video.
  function handleQuizStart() {
    if (isEnrolled && selectedLesson && lessonProgress?.status === "todo") {
      saveLessonProgress(selectedLesson.id, { status: "in_progress" });
    }
  }

  // A lesson quiz result can change the lesson status on the server.
  function handleQuizResponseChange() {
    void queryClient.invalidateQueries({ queryKey: getGetCourseProgressQueryKey({ publicId }) });
  }

  return (
    <View className="p-4">
      {selection.type === "course" && course.thumbnailUrl && (
        <Image
          source={{ uri: course.thumbnailUrl }}
          style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: 8, marginBottom: 16 }}
          contentFit="cover"
        />
      )}
      {/* Status first, full width; the title below it */}
      <View className="gap-3">
        <LearnStatus publicId={publicId} selection={selection} progress={progress} />
        <Text variant="h3">{name}</Text>
      </View>
      {selection.type === "course" && (
        <StarRating className="mt-2" average={course.ratingAverage} count={course.ratingCount} />
      )}

      <LearnVideo
        video={video}
        lessonId={isEnrolled ? selectedLesson?.id : undefined}
        progress={lessonProgress}
        onSave={saveLessonProgress}
      />

      {isDocumentsLoading && <Skeleton className="mt-4 h-16 w-full rounded-lg" />}
      <LearnDocuments documents={documents} />

      <Text className="mt-4 text-muted-foreground">
        {description || t("learn.detail.noDescription")}
      </Text>

      <LearnQuiz
        key={parent.parentId}
        parent={parent}
        isEnrolled={isEnrolled}
        onStart={handleQuizStart}
        onResponseChange={handleQuizResponseChange}
      />
    </View>
  );
}
