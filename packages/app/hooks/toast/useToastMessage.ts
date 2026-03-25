import { useToastController } from '@my/ui';
import { StylingProps } from '@my/ui';

/**
 * Custom hook to show toast messages with various styles and durations.
 */
export function useToastMessage() {
  const toast = useToastController();

  function showMessage({
    title,
    message,
    style,
    duration = 5000, // 5s
  }: {
    title: string;
    message?: string;
    style?: keyof StylingProps;
    duration?: number;
  }) {
    toast.show(title, {
      message,
      customData: {
        style: {
          [style as string]: true,
        },
      },
      duration,
    });
  }

  return {
    showMessage,
  };
}
