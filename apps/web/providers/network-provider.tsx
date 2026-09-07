"use client";

import { useT } from "@repo/i18n/client";
import { toast } from "@repo/ui-web/components/sonner";
import { useEffect, useRef } from "react";

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const { t } = useT();
  const wasOffline = useRef(false);

  useEffect(() => {
    function handleOffline() {
      toast.error(t("errors.offline.title"), { description: t("errors.offline.message") });
      wasOffline.current = true;
    }

    function handleOnline() {
      if (wasOffline.current) {
        toast.success(t("errors.backOnline.title"));
      }
      wasOffline.current = false;
    }

    if (!navigator.onLine && !wasOffline.current) {
      handleOffline();
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [t]);

  return children;
}
