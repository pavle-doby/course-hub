import axios from 'axios';
import { FieldValues, UseFormSetError } from 'react-hook-form';
import { useCallback, useEffect } from 'react';
import { useToastMessage } from '../toast/useToastMessage';
import { authErrorMessages } from './consts/authErrorMessages';
import { userErrorMessages } from './consts/userErrorMessages';
import { sharedErrorMessages } from './consts/sharedErrorMessages';

const allErrorMessages = {
  ...sharedErrorMessages,
  ...authErrorMessages,
  ...userErrorMessages,
};

/**
 * Custom hook for handling errors in forms and API responses.
 */
export function useErrorHandling<T extends FieldValues>({
  error = null,
  setError,
}: {
  error?: Error | null;
  setError?: UseFormSetError<T>;
} = {}) {
  const { showMessage } = useToastMessage();

  // #region Error Handling Functions

  const showErrorForm = useCallback(
    ({ field, message }: { field: string; message: string }) => {
      if (setError) {
        setError(field as Parameters<UseFormSetError<T>>[0], {
          type: 'server',
          message,
        });
      } else {
        showMessage({
          title: `Field: ${field}`,
          message,
          style: 'danger',
        });
      }
    },
    [setError, showMessage]
  );

  const showErrorToast = useCallback(
    (title: string, message = 'Sorry this went wrong... Please try again!') => {
      showMessage({
        title,
        message,
        style: 'danger',
      });
    },
    [showMessage]
  );

  const handleError = useCallback(
    (responseError: Error) => {
      if (!axios.isAxiosError(responseError)) {
        return;
      }

      const data = responseError.response?.data as any | undefined;
      if (!data) return;

      if (Array.isArray(data.error?.issues) && data.error.issues.length > 0) {
        // Handle Zod validation errors (nested inside data.error by the validate middleware)
        for (const issue of data.error.issues) {
          showErrorForm({ field: issue.path.join('.'), message: issue.message });
        }
        return;
      }

      // Handle all other errors
      const mapped = allErrorMessages[data.code as keyof typeof allErrorMessages];
      if (mapped) {
        showErrorToast(mapped.title, mapped.message);
      } else {
        showErrorToast(data.error?.message ?? responseError.message);
      }
    },
    [showErrorForm, showErrorToast]
  );

  // #endregion Error Handling Functions

  useEffect(() => {
    if (error) {
      handleError(error);
    }
  }, [error, handleError]);

  return { handleError };
}
