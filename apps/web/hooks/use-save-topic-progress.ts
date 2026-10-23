import {
  getGetCourseProgressQueryKey,
  useQueryClient,
  useUpdateTopicProgress,
} from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingAction } from "@repo/shared";
import { toast } from "@repo/ui-web/components/sonner";

/**
 * Reports a topic video as watched to the end. The server can then complete the topic (and the
 * course), so the course progress is refetched.
 */
export function useSaveTopicProgress(publicId: string): (topicId: string) => void {
  const { t } = useT();
  const queryClient = useQueryClient();
  const { mutate } = useUpdateTopicProgress();
  const { handleErrorAction } = useErrorHandlingAction({
    t: t as (key: string) => string,
    showToastError: ({ title, description }) => toast.error(title, { description }),
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
