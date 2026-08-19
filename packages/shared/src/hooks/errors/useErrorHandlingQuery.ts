import { useEffect } from "react";
import { useErrorHandlingAction } from "../..";

/**
 * Hook for handling API errors in standalone actions (not tied to a form).
 *
 * Always displays a toast notification with the error message.
 *
 * @param showToastError - Callback to display a toast notification.
 * @param t - Optional translation function.
 */
export function useErrorHandlingQuery({
  error,
  t,
  showToastError,
}: {
  error: Error | null;
  t: (key: string) => string;
  showToastError: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => string | number;
}) {
  const { handleErrorAction } = useErrorHandlingAction({ t, showToastError });

  useEffect(() => {
    if (error) {
      handleErrorAction(error);
    }
  }, [error, handleErrorAction]);

  return { handleErrorAction };
}
