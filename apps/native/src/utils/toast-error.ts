import { toast } from "@repo/ui-native/components/sonner";

/** `showToastError` for the `@repo/shared` error hooks. */
export function showToastError({ title, description }: { title: string; description: string }) {
  return toast.error(title, { description });
}
