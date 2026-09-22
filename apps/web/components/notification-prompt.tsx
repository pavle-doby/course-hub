"use client";

import { useRef, useState } from "react";
import { useT } from "@repo/i18n/client";
import { ChAlertDialog } from "@/components/ch-alert-dialog";

type NotificationPromptProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnable: () => void;
  onDismiss?: () => void;
  description: string;
};

type Stage = "prompt" | "osReminder";

export function NotificationPrompt({
  open,
  onOpenChange,
  onEnable,
  onDismiss,
  description,
}: NotificationPromptProps) {
  const { t } = useT();
  const enabled = useRef(false);
  const [stage, setStage] = useState<Stage>("prompt");

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      onOpenChange(true);
      return;
    }
    if (stage === "prompt" && enabled.current) {
      setStage("osReminder");
      onOpenChange(true);
      return;
    }
    enabled.current = false;
    if (stage === "prompt") {
      onDismiss?.();
    } else {
      setStage("prompt");
    }
    onOpenChange(false);
  }

  function handleEnable() {
    enabled.current = true;
    onEnable();
  }

  if (stage === "osReminder") {
    return (
      <ChAlertDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={t("notifications.osReminderTitle")}
        description={t("notifications.osReminderDescription", {
          currentOS: getOsName(),
          currentBrowserName: getBrowserName(),
        })}
        actionLabel={t("notifications.osReminderConfirm")}
      />
    );
  }

  return (
    <ChAlertDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={t("notifications.title")}
      description={description}
      cancelLabel={t("notifications.cancel")}
      actionLabel={t("notifications.enable")}
      actionProps={{ onClick: handleEnable }}
    />
  );
}

function getOsName(): string {
  const userAgentData = (navigator as Navigator & { userAgentData?: { platform?: string } })
    .userAgentData;
  const platform = userAgentData?.platform ?? navigator.userAgent;
  if (platform.includes("Mac")) return "macOS";
  if (platform.includes("Win")) return "Windows";
  if (platform.includes("Linux")) return "Linux";
  if (platform.includes("Android")) return "Android";
  if (platform.includes("iPhone") || platform.includes("iPad")) return "iOS";
  return "your device";
}

function getBrowserName(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("OPR/") || ua.includes("Opera")) return "Opera";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Chrome/")) return "Chrome";
  if (ua.includes("Safari/")) return "Safari";
  return "your browser";
}
