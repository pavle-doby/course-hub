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
} from "@repo/ui-web/components/alert-dialog";

type ChAlertDialogProps = ComponentProps<typeof AlertDialog> & {
  title: ReactNode;
  description?: ReactNode;
  cancelLabel: ReactNode;
  actionLabel: ReactNode;
  contentProps?: Omit<ComponentProps<typeof AlertDialogContent>, "children">;
  actionProps?: Omit<ComponentProps<typeof AlertDialogAction>, "children">;
};

export function ChAlertDialog({
  children,
  title,
  description,
  cancelLabel,
  actionLabel,
  contentProps,
  actionProps,
  ...props
}: ChAlertDialogProps) {
  return (
    <AlertDialog {...props}>
      {children}
      <AlertDialogContent {...contentProps}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction {...actionProps}>{actionLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
