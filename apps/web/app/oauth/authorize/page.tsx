import { Suspense } from "react";
import { Skeleton } from "@repo/ui-web/components/skeleton";
import { OauthConsent } from "./components/oauth-consent";

// OAuth consent screen: the API's /apix/oauth/authorize redirects here (e.g. from claude.ai connectors)
export default function OauthAuthorizePage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Suspense fallback={<Skeleton className="h-48 w-full max-w-sm" />}>
        <OauthConsent />
      </Suspense>
    </div>
  );
}
