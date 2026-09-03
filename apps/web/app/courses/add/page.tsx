"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCreateCourse,
  useCreateLesson,
  useCreateTopic,
  useDeleteCourse,
  useDeleteLesson,
  useDeleteTopic,
  useGetLessons,
  useGetTopics,
  useUpdateCourse,
  useUpdateLesson,
  useUpdateTopic,
  getGetLessonsQueryKey,
  getGetTopicsQueryKey,
  getGetCoursesQueryKey,
  useQueryClient,
  type CourseStatus,
} from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingAction } from "@repo/shared";
import { toast } from "@repo/ui-web/components/sonner";
import { SidebarProvider } from "@repo/ui-web/components/sidebar";
import { CourseEditorHeader } from "../components/course-editor-header";
import { CourseTreeNav } from "../components/course-tree-nav";
import { CourseWorkingArea } from "../components/course-working-area";
import { useCourseTree } from "../hooks/use-course-tree";
import type { EntityFormHandle, EntityFormValues } from "../components/entity-form";
import type { Selection } from "../types";

export default function AddCoursePage() {
  const router = useRouter();
  const { t } = useT();
  const queryClient = useQueryClient();
  const { handleErrorAction } = useErrorHandlingAction({
    t: t as (key: string) => string,
    showToastError: ({ title, description }) => toast.error(title, { description }),
  });

  const [courseId, setCourseId] = useState<string>();
  const [course, setCourse] = useState<{
    name: string;
    description?: string | null;
    status?: CourseStatus;
  }>({
    name: "",
    description: "",
  });
  const [selection, setSelection] = useState<Selection>({ type: "course" });
  const [autoSave, setAutoSave] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const formRef = useRef<EntityFormHandle>(null);
  const hasShownAutoSaveToast = useRef(false);

  useEffect(() => {
    if (hasShownAutoSaveToast.current) return;
    hasShownAutoSaveToast.current = true;
    toast.success(t("courses.editor.autoSaveOnToast"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAutoSaveChange(value: boolean) {
    setAutoSave(value);
    toast.success(t(value ? "courses.editor.autoSaveOnToast" : "courses.editor.autoSaveOffToast"));
  }

  const { data: topicsData, isLoading: isTopicsLoading } = useGetTopics(
    { courseId },
    { query: { enabled: !!courseId } }
  );
  const { data: lessonsData, isLoading: isLessonsLoading } = useGetLessons(
    { courseId },
    { query: { enabled: !!courseId } }
  );
  const isLoadingTree = isTopicsLoading || isLessonsLoading;
  const tree = useCourseTree(topicsData?.data, lessonsData?.data);
  const flatLessons = tree.flatMap((topic) => topic.lessons);

  const { mutateAsync: createCourse } = useCreateCourse();
  const { mutateAsync: updateCourse } = useUpdateCourse();
  const { mutateAsync: deleteCourse } = useDeleteCourse();
  const { mutateAsync: createTopic } = useCreateTopic();
  const { mutateAsync: updateTopic } = useUpdateTopic();
  const { mutateAsync: deleteTopic } = useDeleteTopic();
  const { mutateAsync: createLesson } = useCreateLesson();
  const { mutateAsync: updateLesson } = useUpdateLesson();
  const { mutateAsync: deleteLesson } = useDeleteLesson();

  async function invalidateTopicsAndLessons() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getGetTopicsQueryKey({ courseId }) }),
      queryClient.invalidateQueries({ queryKey: getGetLessonsQueryKey({ courseId }) }),
    ]);
  }

  async function ensureCourseId(): Promise<string> {
    if (courseId) return courseId;
    const created = await createCourse({
      data: { name: course.name || t("courses.editor.untitledCourse") },
    });
    setCourseId(created.id);
    setCourse({ name: created.name, description: created.description, status: created.status });
    return created.id;
  }

  async function handleSaveCourse(data: EntityFormValues) {
    try {
      if (!courseId) {
        const created = await createCourse({ data });
        setCourseId(created.id);
        setCourse({ name: created.name, description: created.description, status: created.status });
      } else {
        const updated = await updateCourse({ pathParams: { id: courseId }, data });
        if (updated)
          setCourse({
            name: updated.name,
            description: updated.description,
            status: updated.status,
          });
      }
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleSaveTopic(id: string, data: EntityFormValues) {
    try {
      await updateTopic({ pathParams: { id }, data });
      await invalidateTopicsAndLessons();
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleSaveLesson(id: string, data: EntityFormValues) {
    try {
      await updateLesson({ pathParams: { id }, data });
      await invalidateTopicsAndLessons();
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleAddTopic() {
    try {
      const id = await ensureCourseId();
      const created = await createTopic({
        data: { courseId: id, name: t("courses.editor.newTopicName"), position: tree.length },
      });
      await invalidateTopicsAndLessons();
      setSelection({ type: "topic", id: created.id });
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleAddLesson(topicId?: string) {
    if (!topicId) return;
    try {
      const topic = tree.find((t) => t.id === topicId);
      const created = await createLesson({
        data: {
          topicId,
          name: t("courses.editor.newLessonName"),
          position: topic?.lessons.length ?? 0,
        },
      });
      await invalidateTopicsAndLessons();
      setSelection({ type: "lesson", id: created.id });
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleReorderTopics(orderedIds: string[]) {
    try {
      await Promise.all(
        orderedIds.map((id, position) => updateTopic({ pathParams: { id }, data: { position } }))
      );
      await invalidateTopicsAndLessons();
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleReorderLessons(orderedIds: string[]) {
    try {
      await Promise.all(
        orderedIds.map((id, position) => updateLesson({ pathParams: { id }, data: { position } }))
      );
      await invalidateTopicsAndLessons();
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleDeleteTopic(id: string) {
    try {
      await deleteTopic({ pathParams: { id } });
      await invalidateTopicsAndLessons();
      if (selection.type === "topic" && selection.id === id) {
        setSelection({ type: "course" });
      }
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleDuplicateTopic(id: string) {
    try {
      const topic = tree.find((t) => t.id === id);
      if (!topic || !courseId) return;
      const created = await createTopic({
        data: {
          courseId,
          name: topic.name,
          description: topic.description,
          position: tree.length,
        },
      });
      await invalidateTopicsAndLessons();
      setSelection({ type: "topic", id: created.id });
      toast.success(t("courses.editor.duplicatedToast"));
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleDeleteLesson(id: string) {
    try {
      await deleteLesson({ pathParams: { id } });
      await invalidateTopicsAndLessons();
      if (selection.type === "lesson" && selection.id === id) {
        setSelection({ type: "course" });
      }
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleDuplicateLesson(id: string) {
    try {
      const lesson = flatLessons.find((l) => l.id === id);
      if (!lesson) return;
      const topic = tree.find((t) => t.id === lesson.topicId);
      const created = await createLesson({
        data: {
          topicId: lesson.topicId,
          name: lesson.name,
          description: lesson.description,
          position: topic?.lessons.length ?? 0,
        },
      });
      await invalidateTopicsAndLessons();
      setSelection({ type: "lesson", id: created.id });
      toast.success(t("courses.editor.duplicatedToast"));
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  function handleBackOrCancel() {
    router.push("/courses");
  }

  async function handleSave() {
    await formRef.current?.flush();
    toast.success(t("courses.editor.savedToast"));
  }

  async function handlePublish() {
    try {
      await formRef.current?.flush();
      const id = await ensureCourseId();
      const nextStatus = course.status === "published" ? "draft" : "published";
      const updated = await updateCourse({
        pathParams: { id },
        data:
          nextStatus === "published"
            ? { status: nextStatus, publishedAt: new Date().toISOString() }
            : { status: nextStatus },
      });
      if (updated)
        setCourse({ name: updated.name, description: updated.description, status: updated.status });
      toast.success(
        nextStatus === "published"
          ? t("courses.editor.publishedToast")
          : t("courses.editor.unpublishedToast")
      );
      router.push("/courses");
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleArchiveCourse() {
    if (!courseId) return;
    try {
      await updateCourse({ pathParams: { id: courseId }, data: { status: "archived" } });
      toast.success(t("courses.editor.archivedToast"));
      router.push("/courses");
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleDeleteCourse() {
    if (!courseId) return;
    try {
      await deleteCourse({ pathParams: { id: courseId } });
      await queryClient.invalidateQueries({ queryKey: getGetCoursesQueryKey() });
      router.push("/courses");
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleDuplicateCourse() {
    try {
      const created = await createCourse({
        data: { name: course.name, description: course.description ?? undefined },
      });
      toast.success(t("courses.editor.duplicatedToast"));
      router.push(`/courses/${created.publicId}/edit`);
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-svh flex-1 flex-row">
        <CourseTreeNav
          courseName={course.name || t("courses.editor.untitledCourse")}
          tree={tree}
          selection={selection}
          onSelectCourse={() => setSelection({ type: "course" })}
          onSelectTopic={(id) => setSelection({ type: "topic", id })}
          onSelectLesson={(id) => setSelection({ type: "lesson", id })}
          onAddTopic={handleAddTopic}
          onAddLesson={handleAddLesson}
          onReorderTopics={handleReorderTopics}
          onReorderLessons={handleReorderLessons}
          isLoadingTree={isLoadingTree}
          onArchiveCourse={courseId ? handleArchiveCourse : undefined}
          onDeleteCourse={courseId ? handleDeleteCourse : undefined}
        />

        <div className="flex flex-1 flex-col">
          <CourseEditorHeader
            title={t("courses.addCourse")}
            autoSave={autoSave}
            onAutoSaveChange={handleAutoSaveChange}
            isSaving={isSaving}
            isPublished={course.status === "published"}
            onBack={handleBackOrCancel}
            onCancel={handleBackOrCancel}
            onSave={handleSave}
            onPublish={handlePublish}
          />

          <CourseWorkingArea
            formRef={formRef}
            selection={selection}
            autoSave={autoSave}
            course={course}
            tree={tree}
            flatLessons={flatLessons}
            onSaveCourse={handleSaveCourse}
            onSaveTopic={handleSaveTopic}
            onSaveLesson={handleSaveLesson}
            onAddTopic={handleAddTopic}
            onAddLesson={handleAddLesson}
            onDeleteTopic={handleDeleteTopic}
            onDuplicateTopic={handleDuplicateTopic}
            onDeleteLesson={handleDeleteLesson}
            onDuplicateLesson={handleDuplicateLesson}
            onNavigate={setSelection}
            onSavingChange={setIsSaving}
            onDuplicateCourse={handleDuplicateCourse}
            onPublishCourse={handlePublish}
            onArchiveCourse={courseId ? handleArchiveCourse : undefined}
            onDeleteCourse={courseId ? handleDeleteCourse : undefined}
          />
        </div>
      </div>
    </SidebarProvider>
  );
}
