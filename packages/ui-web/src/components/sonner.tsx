"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps, toast } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group [&_[data-type=error]_[data-description]]:text-red-500! [&_[data-type=error]_[data-title]]:text-red-500! [&_[data-type=info]_[data-description]]:text-blue-500! [&_[data-type=info]_[data-title]]:text-blue-500! [&_[data-type=success]_[data-description]]:text-emerald-500! [&_[data-type=success]_[data-title]]:text-emerald-500! [&_[data-type=warning]_[data-description]]:text-yellow-500! [&_[data-type=warning]_[data-title]]:text-yellow-500!"
      closeButton={props.closeButton ?? true}
      icons={{
        success: <CircleCheckIcon className="size-4 text-emerald-500" />,
        info: <InfoIcon className="size-4 text-blue-500" />,
        warning: <TriangleAlertIcon className="size-4 text-yellow-500" />,
        error: <OctagonXIcon className="size-4 text-red-500" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
        close: <XIcon className="size-4" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--toast-close-button-start": "unset",
          "--toast-close-button-end": "0",
          "--toast-close-button-transform": "translate(-4px, 4px)",
        } as ToasterProps["style"]
      }
      position="top-center"
      toastOptions={{
        duration: 5000,
        closeButton: true,
        classNames: {
          toast: "cn-toast pr-10",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
