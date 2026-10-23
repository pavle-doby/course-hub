import {
  getGetCourseProgressQueryKey,
  useQueryClient,
  useUpdateTopicProgress,
} from "@repo/api-client";
import { useTranslation } from "@repo/i18n/native";
import { useErrorHandlingAction } from "@repo/shared";
import { showToastError } from "@/utils/toast-error";

/**
 * Reports a topic video as watched to the end (web: `useSaveTopicProgress`). The server can then
 * complete the topic (and the course), so the course progress is refetched.
 */
export function useSaveTopicProgress(publicId: string): (topicId: string) => void {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutate } = useUpdateTopicProgress();
  const { handleErrorAction } = useErrorHandlingAction({
    t: t as (key: string) => string,
    showToastError,
  });

  return function saveTopicVideoWatched(topicId) {
    mutate(
      { pathParams: { topicId }, data: { videoWatched: true } },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: getGetCourseProgressQueryKey({ publicId }),
          });
        },
        onError: handleErrorAction,
      }
    );
  };
}
