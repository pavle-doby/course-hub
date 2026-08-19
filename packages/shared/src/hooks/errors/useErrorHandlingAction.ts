import { allErrorMessages } from "@repo/shared/consts/allErrorMessages";
import axios from "axios";
import { useCallback } from "react";

/**
 * Hook for handling API errors in standalone actions (not tied to a form).
 *
 * Always displays a toast notification with the error message.
 *
 * @param showToastError - Callback to display a toast notification.
 * @param t - Optional translation function.
 */
export function useErrorHandlingAction({
  t,
  showToastError,
}: {
  t: (key: string) => string;
  showToastError: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => string | number;
}) {
  const handleErrorAction = useCallback(
    (responseError: Error) => {
      if (!axios.isAxiosError(responseError)) return;

      const data = responseError.response?.data as any | undefined;
      if (!data) return;

      const mapped = allErrorMessages[data.code as keyof typeof allErrorMessages];
      if (mapped) {
        showToastError({
          title: t(mapped.title),
          description: t(mapped.message),
        });
      } else {
        showToastError({
          title: data.error?.message ?? responseError.message,
          description: "",
        });
      }
    },
    [showToastError, t]
  );

  return { handleErrorAction };
}
