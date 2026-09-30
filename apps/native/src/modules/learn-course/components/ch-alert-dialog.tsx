import type { ComponentProps, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui-native/components/alert-dialog";
import { buttonTextVariants, buttonVariants } from "@repo/ui-native/components/button";
import { Text } from "@repo/ui-native/components/text";

type ChAlertDialogProps = ComponentProps<typeof AlertDialog> & {
  title: ReactNode;
  description?: ReactNode;
  cancelLabel?: ReactNode;
  actionLabel: ReactNode;
  /** `destructive` restyles the action button. */
  actionVariant?: "default" | "destructive";
  onAction: () => void;
};

/** Confirmation dialog: title, optional description, cancel + action (native port of the web one). */
export function ChAlertDialog({
  children,
  title,
  description,
  cancelLabel,
  actionLabel,
  actionVariant = "default",
  onAction,
  ...props
}: ChAlertDialogProps) {
  return (
    <AlertDialog {...props}>
      {children}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {cancelLabel && (
            <AlertDialogCancel>
              <Text>{cancelLabel}</Text>
            </AlertDialogCancel>
          )}
          {/* AlertDialogAction sets the default button text class, so the variant's goes on the Text */}
          <AlertDialogAction
            className={buttonVariants({ variant: actionVariant })}
            onPress={onAction}
          >
            <Text className={buttonTextVariants({ variant: actionVariant })}>{actionLabel}</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
