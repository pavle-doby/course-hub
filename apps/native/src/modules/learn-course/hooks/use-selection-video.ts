import { useGetPublicVideoByParent, useGetVideoByParent } from "@repo/api-client";
import { getVideoRefetchInterval } from "@/modules/learn-course/utils/get-video-refetch-interval";

type VideoParent = {
  parentType: "course" | "topic" | "lesson";
  parentId: string;
};

/**
 * Video of the selected course / topic / lesson (web: in `LearnWorkingArea`). Enrolled learners
 * get the selection's video; everyone else only the course's public one. Polls while the video is
 * uploading or processing.
 */
export function useSelectionVideo(parent: VideoParent, courseId: string, isEnrolled: boolean) {
  const { data: video, isLoading: isVideoLoading } = useGetVideoByParent(parent, {
    query: {
      enabled: isEnrolled,
      refetchInterval: (query) => getVideoRefetchInterval(query.state.data?.status),
    },
  });
  const { data: publicVideo, isLoading: isPublicVideoLoading } = useGetPublicVideoByParent(
    { parentType: "course", parentId: courseId },
    {
      query: {
        enabled: !isEnrolled,
        refetchInterval: (query) => getVideoRefetchInterval(query.state.data?.status),
      },
    }
  );

  const activeVideo = isEnrolled ? video : publicVideo;
  const isReady = activeVideo?.status === "ready";
  const isError = activeVideo?.status === "error";

  return {
    video: activeVideo,
    isLoading: isEnrolled ? isVideoLoading : isPublicVideoLoading,
    isReady,
    isError,
    isProcessing: !!activeVideo && !isReady && !isError,
  };
}
