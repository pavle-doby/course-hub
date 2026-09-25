"use client";

import { useT } from "@repo/i18n/client";
import { PageHeader } from "@/components/page-header";
import { NotificationPreferencesCard } from "./components/notification-preferences-card";
import { PreferencesCard } from "./components/preferences-card";

export default function SettingsPage() {
  const { t } = useT();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader className="mb-6 hidden md:flex" title={t("settings.title")} />
      <div className="flex flex-col items-center gap-6 px-4 pt-4 pb-4 md:px-6 md:pt-0 md:pb-6">
        <PreferencesCard />
        <NotificationPreferencesCard />
      </div>
    </div>
  );
}
