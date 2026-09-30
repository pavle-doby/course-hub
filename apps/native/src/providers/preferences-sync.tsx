import { useEffect } from "react";
import { useGetUserPreferences } from "@repo/api-client";
import { useApplyPreferences } from "@/hooks/use-apply-preferences";

/** Applies the signed-in user's saved language and theme (cold start and after login). */
export function PreferencesSync() {
  const { data } = useGetUserPreferences();
  const applyPreferences = useApplyPreferences();

  useEffect(() => {
    if (data) {
      applyPreferences(data);
    }
  }, [data, applyPreferences]);

  return null;
}
