"use client";

import { useState } from "react";
import { Info, KeyRound, Plus } from "lucide-react";
import {
  getGetApiTokensQueryKey,
  useDeleteApiToken,
  useGetApiTokens,
  useQueryClient,
  type ApiToken,
} from "@repo/api-client";
import { Trans, useT } from "@repo/i18n/client";
import { useErrorHandlingAction, useErrorHandlingQuery } from "@repo/shared";
import { Button } from "@repo/ui-web/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui-web/components/card";
import { Skeleton } from "@repo/ui-web/components/skeleton";
import { toast } from "@repo/ui-web/components/sonner";
import { ChAlertDialog } from "@/components/ch-alert-dialog";
import { CLAUDE_CONNECTORS_SETTINGS_URL, MCP_URL } from "@/utils/consts";
import { ApiTokenDetailsDialog } from "./api-token-details-dialog";
import { CreateApiTokenDialog } from "./create-api-token-dialog";
import { Snippet } from "./mcp-config-snippets";

export function AiAccessCard() {
  const { t } = useT();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [tokenToRevoke, setTokenToRevoke] = useState<ApiToken>();
  const [tokenDetails, setTokenDetails] = useState<ApiToken>();

  const { data: tokens, isPending, error } = useGetApiTokens();
  const { mutateAsync: deleteToken } = useDeleteApiToken();
  const showToastError = ({ title, description }: { title: string; description?: string }) =>
    toast.error(title, { description });
  useErrorHandlingQuery({ t: t as (key: string) => string, error, showToastError });
  const { handleErrorAction } = useErrorHandlingAction({
    t: t as (key: string) => string,
    showToastError,
  });

  function handleOpenCreate() {
    setCreateOpen(true);
  }

  function handleDetailsOpenChange(open: boolean) {
    if (!open) {
      setTokenDetails(undefined);
    }
  }

  function handleRevokeOpenChange(open: boolean) {
    if (!open) {
      setTokenToRevoke(undefined);
    }
  }

  async function handleRevoke() {
    if (!tokenToRevoke) {
      return;
    }
    try {
      await deleteToken({ pathParams: { id: tokenToRevoke.id } });
      await queryClient.invalidateQueries({ queryKey: getGetApiTokensQueryKey() });
      toast.success(t("settings.aiAccess.revokedToast"));
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString();
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="border-b">
        <CardTitle>{t("settings.aiAccess.title")}</CardTitle>
        <CardDescription>{t("settings.aiAccess.description")}</CardDescription>
        <CardAction>
          <Button type="button" onClick={handleOpenCreate}>
            <Plus /> {t("settings.aiAccess.createToken")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 border-b pb-4">
          <Snippet label={t("settings.aiAccess.connectorUrl")} text={MCP_URL} />
          <p className="text-xs text-muted-foreground">
            <Trans
              t={t}
              i18nKey="settings.aiAccess.connectorUrlHint"
              components={{
                connectorsLink: (
                  <a
                    href={CLAUDE_CONNECTORS_SETTINGS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline underline-offset-4"
                  />
                ),
              }}
            />
          </p>
        </div>
        {isPending && <Skeleton className="h-14 w-full" />}
        {tokens?.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("settings.aiAccess.empty")}</p>
        )}
        {tokens?.map((token) => (
          <TokenRow
            key={token.id}
            token={token}
            formatDate={formatDate}
            onDetails={setTokenDetails}
            onRevoke={setTokenToRevoke}
          />
        ))}
      </CardContent>

      <CreateApiTokenDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ApiTokenDetailsDialog token={tokenDetails} onOpenChange={handleDetailsOpenChange} />
      <ChAlertDialog
        open={!!tokenToRevoke}
        onOpenChange={handleRevokeOpenChange}
        title={t("settings.aiAccess.revokeDialog.title")}
        description={t("settings.aiAccess.revokeDialog.description", {
          name: tokenToRevoke?.name,
        })}
        cancelLabel={t("settings.aiAccess.revokeDialog.cancel")}
        actionLabel={t("settings.aiAccess.revokeDialog.confirm")}
        actionProps={{ variant: "destructive", onClick: handleRevoke }}
      />
    </Card>
  );
}

type TokenRowProps = {
  token: ApiToken;
  formatDate: (date: string) => string;
  onDetails: (token: ApiToken) => void;
  onRevoke: (token: ApiToken) => void;
};

function TokenRow({ token, formatDate, onDetails, onRevoke }: TokenRowProps) {
  const { t } = useT();

  function handleDetails() {
    onDetails(token);
  }

  function handleRevoke() {
    onRevoke(token);
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <KeyRound className="size-4 shrink-0 text-muted-foreground" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{token.name}</span>
        <span className="text-xs text-muted-foreground">
          {token.lastUsedAt
            ? t("settings.aiAccess.lastUsed", { date: formatDate(token.lastUsedAt) })
            : t("settings.aiAccess.neverUsed")}
          {" · "}
          {t("settings.aiAccess.created", { date: formatDate(token.createdAt) })}
        </span>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={t("settings.aiAccess.details")}
        onClick={handleDetails}
      >
        <Info /> <span className="hidden md:inline">{t("settings.aiAccess.details")}</span>
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={handleRevoke}>
        {t("settings.aiAccess.revoke")}
      </Button>
    </div>
  );
}
