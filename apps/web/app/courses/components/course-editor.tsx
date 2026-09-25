"use client";

import { useEffect, useRef, useState } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import {
  useCreateCourse,
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
  useSubscribeNotifications,
  getGetLessonsQueryKey,
  getGetTopicsQueryKey,
  getGetCoursesQueryKey,
  useQueryClient,
  type Course,
  type CourseStatus,
  type CourseVisibility,
} from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingAction } from "@repo/shared";
import { toast } from "@repo/ui-web/components/sonner";
import { SidebarProvider } from "@repo/ui-web/components/sidebar";
import { isTypingTarget } from "@/utils/is-typing-target";
import { notificationsService } from "@/services/notifications-service";
import { NotificationPrompt } from "@/components/notification-prompt";
import { CourseEditorHeader } from "./course-editor-header";
import { CourseBottomNav } from "./course-bottom-nav";
import { CourseActions } from "./course-actions";
import { CourseEditSkeleton } from "./course-edit-skeleton";
import { CourseEditError } from "./course-edit-error";
import { CourseTreeNav } from "./course-tree-nav";
import { CourseWorkingArea } from "./course-working-area";
import { useAdjacentSelection, useCourseTree, type Selection } from "@/hooks/use-course-tree";
import type { EntityFormHandle, EntityFormValues } from "./entity-form";

type CourseDraft = {
  name: string;
  description?: string | null;
  status?: CourseStatus;
  visibility?: CourseVisibility;
  aiAccessEnabled?: boolean;
};

function toCourseDraft(course: Course): CourseDraft {
  return {
    name: course.name,
    description: course.description,
    status: course.status,
    visibility: course.visibility,
    aiAccessEnabled: course.aiAccessEnabled,
  };
}

type CourseEditorProps = { mode: "create"; publicId?: never } | { mode: "edit"; publicId: string };

/** Immersive course editor shared by the add-course and edit-course routes. */
export function CourseEditor({ mode, publicId }: CourseEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useT();
  const queryClient = useQueryClient();
  const { handleErrorAction } = useErrorHandlingAction({
    t: t as (key: string) => string,
    showToastError: ({ title, description }) => toast.error(title, { description }),
  });

  const [createdCourseId, setCreatedCourseId] = useState<string>();
  const [createdCoursePublicId, setCreatedCoursePublicId] = useState<string>();
  // create mode starts with an empty draft; edit mode seeds from the fetched course
  const [course, setCourse] = useState<CourseDraft | undefined>(
    mode === "create" ? { name: "", description: "" } : undefined
  );
  // "?lesson=<id>" / "?topic=<id>" open the editor on that item (bookmarkable, kept in sync below)
  const [selection, setSelection] = useState<Selection>(() => {
    const lessonId = searchParams.get("lesson");
    if (lessonId) {
      return { type: "lesson", id: lessonId };
    }
    const topicId = searchParams.get("topic");
    return topicId ? { type: "topic", id: topicId } : { type: "course" };
  });
  const [autoSave, setAutoSave] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [actionsOpenMobile, setActionsOpenMobile] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [notificationCourseId, setNotificationCourseId] = useState<string>();
  const [activeTab, setActiveTab] = useState<"edit" | "invite">(
    searchParams.get("tab") === "invite" ? "invite" : "edit"
  );

  // disabled (and never queried) in create mode
  const {
    data: fetchedCourse,
    isLoading: isCourseLoading,
    isError: isCourseError,
    error: courseError,
    refetch: refetchCourse,
  } = useGetCourseByPublicId({ publicId: publicId ?? "" }, { query: { enabled: mode === "edit" } });

  const courseId = mode === "edit" ? fetchedCourse?.id : createdCourseId;
  const workingAreaPublicId = mode === "edit" ? publicId : createdCoursePublicId;

  // seeded from the fetched course on first render (no effect needed, avoids a stale-defaultValues flash in EntityForm)
  const displayedCourse: CourseDraft =
    course ?? (fetchedCourse ? toCourseDraft(fetchedCourse) : { name: "", description: "" });

  const {
    data: topicsData,
    isLoading: isTopicsLoading,
    isError: isTopicsError,
  } = useGetTopics({ courseId }, { query: { enabled: !!courseId } });
  const {
    data: lessonsData,
    isLoading: isLessonsLoading,
    isError: isLessonsError,
  } = useGetLessons({ courseId }, { query: { enabled: !!courseId } });
  const isLoading = isCourseLoading || isTopicsLoading || isLessonsLoading;
  const isLoadingTree = isTopicsLoading || isLessonsLoading;
  const isTreeError = isTopicsError || isLessonsError;
  const tree = useCourseTree(topicsData?.data, lessonsData?.data);
  const flatLessons = tree.flatMap((topic) => topic.lessons);
  const { previousItem, nextItem } = useAdjacentSelection(tree, selection);

  const formRef = useRef<EntityFormHandle>(null);
  const hasShownAutoSaveToast = useRef(false);

  const baseRoute = mode === "create" ? "/courses/add" : `/courses/${publicId}/edit`;
  const headerTitle = mode === "create" ? t("courses.addCourse") : t("courses.editCourse");

  useEffect(() => {
    if (mode === "create") {
      if (hasShownAutoSaveToast.current) return;
      hasShownAutoSaveToast.current = true;
      toast.success(t("courses.editor.autoSaveOnToast"));
      return;
    }

    if (!isLoading || hasShownAutoSaveToast.current) return;
    hasShownAutoSaveToast.current = true;

    setTimeout(() => {
      toast.success(t("courses.editor.autoSaveOnToast"));
    }, 700);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, mode]);

  // "f" toggles focus mode (collapses both sidebars) — ignored while typing in a field
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.toLowerCase() !== "f") return;
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      const nextFocus = !focusMode;
      setFocusMode(nextFocus);
      setLeftOpen(!nextFocus);
      setRightOpen(!nextFocus);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusMode]);

  function handleAutoSaveChange(value: boolean) {
    setAutoSave(value);
    toast.success(t(value ? "courses.editor.autoSaveOnToast" : "courses.editor.autoSaveOffToast"));
  }

  // mirrors the selected topic/lesson and tab into the query string so the URL can be bookmarked or shared
  function syncUrl(nextSelection: Selection, nextTab: "edit" | "invite") {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("topic");
    params.delete("lesson");
    // create mode has no stable URL to deep-link into, so only the tab is tracked there
    if (mode === "edit" && nextSelection.type !== "course") {
      params.set(nextSelection.type, nextSelection.id);
    }
    if (nextTab === "invite") {
      params.set("tab", nextTab);
    } else {
      params.delete("tab");
    }
    const qs = params.toString();
    router.replace(qs ? `${baseRoute}?${qs}` : baseRoute, { scroll: false });
  }

  function selectItem(next: Selection) {
    setSelection(next);
    syncUrl(next, activeTab);
  }

  function handleActiveTabChange(value: "edit" | "invite") {
    setActiveTab(value);
    syncUrl(selection, value);
  }

  function handleInviteClick() {
    setSelection({ type: "course" });
    setActiveTab("invite");
    syncUrl({ type: "course" }, "invite");
  }

  const showInviteTab = selection.type === "course" && displayedCourse.visibility === "private";

  const { mutateAsync: createCourse } = useCreateCourse();
  const { mutateAsync: updateCourse } = useUpdateCourse();
  const { mutateAsync: deleteCourse } = useDeleteCourse();
  const { mutateAsync: createTopic } = useCreateTopic();
  const { mutateAsync: updateTopic } = useUpdateTopic();
  const { mutateAsync: deleteTopic } = useDeleteTopic();
  const { mutateAsync: createLesson } = useCreateLesson();
  const { mutateAsync: updateLesson } = useUpdateLesson();
  const { mutateAsync: deleteLesson } = useDeleteLesson();
  const { mutateAsync: subscribeNotifications } = useSubscribeNotifications();

  // real course id resolved above from the public id in edit mode — narrowed for the rest of this render
  if (mode === "edit" && isCourseError) {
    const status = (courseError as { response?: { status?: number } } | undefined)?.response
      ?.status;
    if (status === 404) {
      notFound();
    }
    return <CourseEditError onRetry={refetchCourse} onBack={handleBackOrCancel} />;
  }
  if (mode === "edit" && isCourseLoading) {
    return <CourseEditSkeleton />;
  }

  async function invalidateTopicsAndLessons() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getGetTopicsQueryKey({ courseId }) }),
      queryClient.invalidateQueries({ queryKey: getGetLessonsQueryKey({ courseId }) }),
    ]);
  }

  async function ensureCourseId(): Promise<string> {
    if (mode === "edit") {
      if (!courseId) throw new Error("Course not loaded");
      return courseId;
    }
    if (courseId) return courseId;
    const created = await createCourse({
      data: { name: course?.name || t("courses.editor.untitledCourse") },
    });
    setCreatedCourseId(created.id);
    setCreatedCoursePublicId(created.publicId);
    setCourse(toCourseDraft(created));
    return created.id;
  }

  async function handleVisibilityChange(visibility: CourseVisibility) {
    try {
      const id = await ensureCourseId();
      const updated = await updateCourse({ pathParams: { id }, data: { visibility } });
      if (updated) {
        setCourse(toCourseDraft(updated));
        toast.success(t("courses.editor.visibilityChangedToast"));
      }
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleAiAccessChange(aiAccessEnabled: boolean) {
    try {
      const id = await ensureCourseId();
      const updated = await updateCourse({ pathParams: { id }, data: { aiAccessEnabled } });
      if (updated) {
        setCourse(toCourseDraft(updated));
        toast.success(t("courses.editor.aiAccessChangedToast"));
      }
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleSaveCourse(data: EntityFormValues) {
    try {
      if (!courseId) {
        const created = await createCourse({ data });
        setCreatedCourseId(created.id);
        setCreatedCoursePublicId(created.publicId);
        setCourse(toCourseDraft(created));
      } else {
        const updated = await updateCourse({ pathParams: { id: courseId }, data });
        if (updated) {
          setCourse(toCourseDraft(updated));
        }
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
      selectItem({ type: "topic", id: created.id });
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
      selectItem({ type: "lesson", id: created.id });
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
        selectItem({ type: "course" });
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
          description: topic.description ?? undefined,
          position: tree.length,
        },
      });
      await invalidateTopicsAndLessons();
      selectItem({ type: "topic", id: created.id });
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
        selectItem({ type: "course" });
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
      selectItem({ type: "lesson", id: created.id });
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
      const nextStatus = displayedCourse.status === "published" ? "draft" : "published";
      const updated = await updateCourse({
        pathParams: { id },
        data:
          nextStatus === "published"
            ? { status: nextStatus, publishedAt: new Date().toISOString() }
            : { status: nextStatus },
      });
      if (updated) {
        setCourse(toCourseDraft(updated));
        if (nextStatus === "published") {
          if (!notificationsService.isCreatorPromptDismissed(updated.id)) {
            setNotificationCourseId(updated.id);
          }
        }
      }
      toast.success(
        nextStatus === "published"
          ? t("courses.editor.publishedToast")
          : t("courses.editor.unpublishedToast")
      );
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  function handleNotificationOpenChange(open: boolean) {
    if (!open) {
      setNotificationCourseId(undefined);
    }
  }

  function handleNotificationDismiss() {
    if (notificationCourseId) {
      notificationsService.dismissCreatorPrompt(notificationCourseId);
    }
  }

  function handleNotificationEnable() {
    if (!notificationCourseId) {
      return;
    }
    void notificationsService
      .enableCreatorNotifications({
        courseId: notificationCourseId,
        subscribeNotifications,
      })
      .catch((error: unknown) => {
        console.error(error);
        if (!(error instanceof Error)) {
          return handleErrorAction(error);
        }
        toast.error(error.message);
      });
  }

  async function handleArchiveCourse() {
    if (!courseId) return;
    try {
      const updated = await updateCourse({
        pathParams: { id: courseId },
        data: { status: "archived" },
      });
      if (updated) {
        setCourse(toCourseDraft(updated));
      }
      toast.success(t("courses.editor.archivedToast"));
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
        data: { name: displayedCourse.name, description: displayedCourse.description ?? undefined },
      });
      toast.success(t("courses.editor.duplicatedToast"));
      router.push(`/courses/${created.publicId}/edit`);
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  return (
    <SidebarProvider open={leftOpen} onOpenChange={setLeftOpen}>
      <NotificationPrompt
        open={!!notificationCourseId}
        onOpenChange={handleNotificationOpenChange}
        onDismiss={handleNotificationDismiss}
        onEnable={handleNotificationEnable}
        description={t("notifications.creatorPrompt")}
      />
      <div className="flex min-h-svh flex-1 flex-row">
        <CourseTreeNav
          courseName={displayedCourse.name || t("courses.editor.untitledCourse")}
          tree={tree}
          selection={selection}
          onSelectCourse={() => selectItem({ type: "course" })}
          onSelectTopic={(id) => selectItem({ type: "topic", id })}
          onSelectLesson={(id) => selectItem({ type: "lesson", id })}
          onAddTopic={handleAddTopic}
          onAddLesson={handleAddLesson}
          onReorderTopics={handleReorderTopics}
          onReorderLessons={handleReorderLessons}
          isLoadingTree={isLoadingTree}
          isTreeError={isTreeError}
          onRetryTree={() => invalidateTopicsAndLessons()}
        />

        <div className="flex flex-1 flex-col">
          <CourseEditorHeader
            title={headerTitle}
            autoSave={autoSave}
            onAutoSaveChange={handleAutoSaveChange}
            isSaving={isSaving}
            onBack={handleBackOrCancel}
            onCancel={handleBackOrCancel}
            onSave={handleSave}
            showInviteTab={showInviteTab}
            activeTab={activeTab}
            onActiveTabChange={handleActiveTabChange}
          />

          <CourseWorkingArea
            formRef={formRef}
            selection={selection}
            autoSave={autoSave}
            course={displayedCourse}
            thumbnailUrl={fetchedCourse?.thumbnailUrl}
            courseId={courseId}
            visibility={displayedCourse.visibility}
            publicId={workingAreaPublicId}
            activeTab={activeTab}
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
            onNavigate={selectItem}
            onSavingChange={setIsSaving}
            onDuplicateCourse={handleDuplicateCourse}
            onDeleteCourse={courseId ? handleDeleteCourse : undefined}
          />

          <CourseBottomNav
            isSaving={isSaving}
            onCancel={handleBackOrCancel}
            onSave={handleSave}
            hasPrevious={!!previousItem}
            hasNext={!!nextItem}
            onPrevious={() => previousItem && selectItem(previousItem)}
            onNext={() => nextItem && selectItem(nextItem)}
            onOpenActions={() => setActionsOpenMobile(true)}
          />
        </div>

        <SidebarProvider
          className="contents"
          open={rightOpen}
          onOpenChange={setRightOpen}
          openMobile={actionsOpenMobile}
          onOpenMobileChange={setActionsOpenMobile}
        >
          <CourseActions
            status={displayedCourse.status ?? "draft"}
            visibility={displayedCourse.visibility}
            onVisibilityChange={courseId ? handleVisibilityChange : undefined}
            onInviteClick={courseId ? handleInviteClick : undefined}
            aiAccessEnabled={displayedCourse.aiAccessEnabled}
            onAiAccessChange={courseId ? handleAiAccessChange : undefined}
            isPublished={displayedCourse.status === "published"}
            onPublishCourse={courseId ? handlePublish : undefined}
            onArchiveCourse={courseId ? handleArchiveCourse : undefined}
            onDeleteCourse={courseId ? handleDeleteCourse : undefined}
          />
        </SidebarProvider>
      </div>
    </SidebarProvider>
  );
}
