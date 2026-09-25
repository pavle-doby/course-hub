"use client";

import { useSearchParams } from "next/navigation";
import { PlugZapIcon } from "lucide-react";
import { useApproveOauth } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingAction } from "@repo/shared";
import { Button } from "@repo/ui-web/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui-web/components/card";
import { toast } from "@repo/ui-web/components/sonner";

// ponytail: the client_id is the API's signed registration payload; only its name is read here.
// Display only: the API verifies the signature and redirect_uri before issuing a code.
function getClientName(clientId: string): string | undefined {
  try {
    const [body = ""] = clientId.split(".");
    const bytes = Uint8Array.from(atob(body.replace(/-/g, "+").replace(/_/g, "/")), (char) =>
      char.charCodeAt(0)
    );
    return (JSON.parse(new TextDecoder().decode(bytes)) as { name?: string }).name;
  } catch {
    return undefined;
  }
}

function getHost(uri: string): string | undefined {
  try {
    return new URL(uri).host;
  } catch {
    return undefined;
  }
}

export function OauthConsent() {
  const { t } = useT();
  const searchParams = useSearchParams();
  const clientId = searchParams.get("client_id") ?? "";
  const redirectUri = searchParams.get("redirect_uri") ?? "";
  const codeChallenge = searchParams.get("code_challenge") ?? "";
  const state = searchParams.get("state") ?? undefined;
  const clientName = getClientName(clientId) ?? t("settings.aiAccess.authorize.unknownClient");
  const redirectHost = getHost(redirectUri);

  const { mutate: approveOauth, isPending, isSuccess } = useApproveOauth();
  const { handleErrorAction } = useErrorHandlingAction({
    t: t as (key: string) => string,
    showToastError: ({ title, description }) => toast.error(title, { description }),
  });

  function answer(approve: boolean) {
    approveOauth(
      { data: { clientId, redirectUri, codeChallenge, state, approve } },
      {
        onSuccess: ({ redirectUrl }) => {
          window.location.assign(redirectUrl);
        },
        onError: (error: unknown) => {
          handleErrorAction(error as Error);
        },
      }
    );
  }

  function handleAllow() {
    answer(true);
  }

  function handleDeny() {
    answer(false);
  }

  if (!clientId || !redirectHost || !codeChallenge) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="border-b">
          <CardTitle>{t("settings.aiAccess.authorize.invalidTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("settings.aiAccess.authorize.invalidDescription")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <PlugZapIcon className="size-4" />
          {t("settings.aiAccess.authorize.title", { client: clientName })}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <CardDescription>
          {t("settings.aiAccess.authorize.description", { client: clientName })}
        </CardDescription>
        <p className="text-xs text-muted-foreground">
          {t("settings.aiAccess.authorize.redirect", { host: redirectHost })}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={isPending || isSuccess}
            onClick={handleDeny}
          >
            {t("settings.aiAccess.authorize.deny")}
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={isPending || isSuccess}
            onClick={handleAllow}
          >
            {t("settings.aiAccess.authorize.allow")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
