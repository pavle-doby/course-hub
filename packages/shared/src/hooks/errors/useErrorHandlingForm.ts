import axios from "axios";
import { FieldValues, UseFormSetError } from "react-hook-form";
import { useCallback } from "react";
import type { i18n, TFunction } from "i18next";
import { getZodLocale } from "@repo/shared/utils";
import { allErrorMessages } from "../../consts/allErrorMessages";

/**
 * Hook for handling API errors in form submissions.
 *
 * - Maps Zod field issues to individual field errors.
 * - Falls back to a root error when no issues are present.
 *
 * @param setError - React Hook Form setter for field and root errors.
 * @param t - Optional translation function.
 */
export function useErrorHandlingForm<T extends FieldValues>({
  i18n,
  setError,
  t,
}: {
  i18n: i18n;
  setError: UseFormSetError<T>;
  t: TFunction<"common", undefined>;
}) {
  const showErrorFormField = useCallback(
    ({ field, message }: { field: string; message: string }) => {
      setError(field as Parameters<UseFormSetError<T>>[0], {
        type: "server",
        message,
      });
    },
    [setError]
  );

  const showErrorFormRoot = useCallback(
    ({ message }: { message: string }) => {
      setError("root" as Parameters<UseFormSetError<T>>[0], {
        type: "server",
        message,
      });
    },
    [setError]
  );

  /**
   * Handles API errors for form submissions.
   *
   * ! P.S. When used, you need to handle form error and show proper alert for the form.
   */
  const handleErrorForm = useCallback(
    (responseError: Error) => {
      if (!axios.isAxiosError(responseError)) return;

      const data = responseError.response?.data as any | undefined;
      if (!data) return;

      if (Array.isArray(data.error?.issues) && data.error.issues.length > 0) {
        // Handle Zod validation errors — set individual field errors
        const locale = getZodLocale(i18n);

        for (const issue of data.error.issues) {
          const messageLocal = locale.localeError(issue);
          const messageStr =
            typeof messageLocal === "string" ? messageLocal : messageLocal?.message;
          const messageFallback = issue.message;

          const message = messageStr || messageFallback;

          showErrorFormField({ field: issue.path.join("."), message });
        }
        return;
      }

      // No field-level issues — set root error
      const mapped = allErrorMessages[data.code as keyof typeof allErrorMessages];
      if (mapped) {
        showErrorFormRoot({ message: t(mapped.message) });
      } else {
        showErrorFormRoot({ message: data.error?.message ?? responseError.message });
      }
    },
    [showErrorFormField, showErrorFormRoot, i18n, t]
  );

  return { handleErrorForm };
}
