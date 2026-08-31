"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useCreateLesson,
  useCreateTopic,
  useDeleteCourse,
  useDeleteLesson,
  useDeleteTopic,
  useGetCourseByPublicId,
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
import { CourseEditorHeader } from "../../components/course-editor-header";
import { CourseTreeNav } from "../../components/course-tree-nav";
import { CourseWorkingArea } from "../../components/course-working-area";
import { useCourseTree } from "../../hooks/use-course-tree";
import type { EntityFormHandle, EntityFormValues } from "../../components/entity-form";
import type { Selection } from "../../types";

export default function EditCoursePage() {
  const { publicId } = useParams<{ publicId: string }>();
  const router = useRouter();
  const { t } = useT();
  const queryClient = useQueryClient();
  const { handleErrorAction } = useErrorHandlingAction({
    t: t as (key: string) => string,
    showToastError: ({ title, description }) => toast.error(title, { description }),
  });

  const [course, setCourse] = useState<{
    name: string;
    description?: string | null;
    status?: CourseStatus;
  }>();
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

  const { data: courseData } = useGetCourseByPublicId({ publicId });
  const id = courseData?.id;
  const { data: topicsData } = useGetTopics({ courseId: id }, { query: { enabled: !!id } });
  const { data: lessonsData } = useGetLessons({ courseId: id }, { query: { enabled: !!id } });
  const tree = useCourseTree(topicsData?.data, lessonsData?.data);
  const flatLessons = tree.flatMap((topic) => topic.lessons);

  // seeded from the fetched course on first render (no effect needed, avoids a stale-defaultValues flash in EntityForm)
  const displayedCourse =
    course ??
    (courseData
      ? { name: courseData.name, description: courseData.description, status: courseData.status }
      : { name: "", description: "" });

  const { mutateAsync: updateCourse } = useUpdateCourse();
  const { mutateAsync: deleteCourse } = useDeleteCourse();
  const { mutateAsync: createTopic } = useCreateTopic();
  const { mutateAsync: updateTopic } = useUpdateTopic();
  const { mutateAsync: deleteTopic } = useDeleteTopic();
  const { mutateAsync: createLesson } = useCreateLesson();
  const { mutateAsync: updateLesson } = useUpdateLesson();
  const { mutateAsync: deleteLesson } = useDeleteLesson();

  // real course id resolved above from the public id — narrowed for the rest of this render
  if (!id) {
    return (
      <div className="flex min-h-svh flex-1 items-center justify-center">
        {t("courses.loading")}
      </div>
    );
  }

  async function invalidateTopicsAndLessons() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getGetTopicsQueryKey({ courseId: id }) }),
      queryClient.invalidateQueries({ queryKey: getGetLessonsQueryKey({ courseId: id }) }),
    ]);
  }

  async function handleSaveCourse(data: EntityFormValues) {
    if (!id) return;

    try {
      const updated = await updateCourse({ pathParams: { id }, data });
      if (updated)
        setCourse({ name: updated.name, description: updated.description, status: updated.status });
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleSaveTopic(topicId: string, data: EntityFormValues) {
    try {
      await updateTopic({ pathParams: { id: topicId }, data });
      await invalidateTopicsAndLessons();
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleSaveLesson(lessonId: string, data: EntityFormValues) {
    try {
      await updateLesson({ pathParams: { id: lessonId }, data });
      await invalidateTopicsAndLessons();
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleAddTopic() {
    if (!id) return;

    try {
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

  async function handleDeleteTopic(topicId: string) {
    try {
      await deleteTopic({ pathParams: { id: topicId } });
      await invalidateTopicsAndLessons();
      if (selection.type === "topic" && selection.id === topicId) {
        setSelection({ type: "course" });
      }
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleDeleteLesson(lessonId: string) {
    try {
      await deleteLesson({ pathParams: { id: lessonId } });
      await invalidateTopicsAndLessons();
      if (selection.type === "lesson" && selection.id === lessonId) {
        setSelection({ type: "course" });
      }
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
    if (!id) return;

    try {
      await formRef.current?.flush();
      const nextStatus = displayedCourse.status === "published" ? "draft" : "published";
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
    if (!id) return;
    try {
      await updateCourse({ pathParams: { id }, data: { status: "archived" } });
      toast.success(t("courses.editor.archivedToast"));
      router.push("/courses");
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleDeleteCourse() {
    if (!id) return;
    try {
      await deleteCourse({ pathParams: { id } });
      await queryClient.invalidateQueries({ queryKey: getGetCoursesQueryKey() });
      router.push("/courses");
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-svh flex-1 flex-row">
        <CourseTreeNav
          courseName={displayedCourse.name || t("courses.editor.untitledCourse")}
          tree={tree}
          selection={selection}
          onSelectCourse={() => setSelection({ type: "course" })}
          onSelectTopic={(topicId) => setSelection({ type: "topic", id: topicId })}
          onSelectLesson={(lessonId) => setSelection({ type: "lesson", id: lessonId })}
          onAddTopic={handleAddTopic}
          onAddLesson={handleAddLesson}
          onDeleteTopic={handleDeleteTopic}
          onDeleteLesson={handleDeleteLesson}
          onArchiveCourse={handleArchiveCourse}
          onDeleteCourse={handleDeleteCourse}
        />

        <div className="flex flex-1 flex-col">
          <CourseEditorHeader
            title={t("courses.editCourse")}
            autoSave={autoSave}
            onAutoSaveChange={handleAutoSaveChange}
            isSaving={isSaving}
            isPublished={displayedCourse.status === "published"}
            onBack={handleBackOrCancel}
            onCancel={handleBackOrCancel}
            onSave={handleSave}
            onPublish={handlePublish}
          />

          <CourseWorkingArea
            formRef={formRef}
            selection={selection}
            autoSave={autoSave}
            course={displayedCourse}
            tree={tree}
            flatLessons={flatLessons}
            onSaveCourse={handleSaveCourse}
            onSaveTopic={handleSaveTopic}
            onSaveLesson={handleSaveLesson}
            onAddTopic={handleAddTopic}
            onAddLesson={handleAddLesson}
            onSelectLesson={(lessonId) => setSelection({ type: "lesson", id: lessonId })}
            onSavingChange={setIsSaving}
          />
        </div>
      </div>
    </SidebarProvider>
  );
}
