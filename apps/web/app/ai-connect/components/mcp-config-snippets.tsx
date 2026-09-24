"use client";

import { useId, useState, type ReactNode } from "react";
import { Copy } from "lucide-react";
import { useT } from "@repo/i18n/client";
import { Button } from "@repo/ui-web/components/button";
import { Label } from "@repo/ui-web/components/label";
import { toast } from "@repo/ui-web/components/sonner";
import { Switch } from "@repo/ui-web/components/switch";
import { MCP_URL } from "@/utils/consts";

type McpConfigSnippetsProps = {
  /** Value used in the snippets: the plaintext token or a placeholder. */
  token: string;
  /** Whether to show the Token section (only right after creation). */
  showToken?: boolean;
};

function mcpConfig(token: string) {
  return JSON.stringify(
    {
      mcpServers: {
        "course-hub": {
          type: "http",
          url: MCP_URL,
          headers: { Authorization: `Bearer ${token}` },
        },
      },
    },
    null,
    2
  );
}

// `user` scope = all projects; `local` scope = only the folder the command runs in
function claudeCodeCommand(token: string, global: boolean) {
  const scope = global ? "user" : "local";
  return `claude mcp add --transport http --scope ${scope} course-hub ${MCP_URL} --header "Authorization: Bearer ${token}"`;
}

export function McpConfigSnippets({ token, showToken = true }: McpConfigSnippetsProps) {
  const id = useId();
  const { t } = useT();
  const [global, setGlobal] = useState(true);

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {showToken && <Snippet label={t("settings.aiAccess.createDialog.token")} text={token} />}
      <Snippet label={t("settings.aiAccess.createDialog.config")} text={mcpConfig(token)} />
      <Snippet
        label={t("settings.aiAccess.createDialog.claudeCode")}
        text={claudeCodeCommand(token, global)}
      >
        <div className="flex items-center gap-2">
          <Switch id={`${id}-global`} size="sm" checked={global} onCheckedChange={setGlobal} />
          <Label htmlFor={`${id}-global`} className="text-xs font-normal">
            {t("settings.aiAccess.createDialog.global")}
          </Label>
        </div>
      </Snippet>
      <p className="-mt-2 text-xs text-muted-foreground">
        {t(
          global
            ? "settings.aiAccess.createDialog.globalHint"
            : "settings.aiAccess.createDialog.localHint"
        )}
      </p>
    </div>
  );
}

type SnippetProps = {
  label: string;
  text: string;
  /** Extra controls shown next to the copy button. */
  children?: ReactNode;
};

export function Snippet({ label, text, children }: SnippetProps) {
  const { t } = useT();

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    toast.success(t("settings.aiAccess.createDialog.copiedToast"));
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          {children}
          <Button type="button" variant="ghost" size="sm" onClick={handleCopy}>
            <Copy /> {t("settings.aiAccess.createDialog.copy")}
          </Button>
        </div>
      </div>
      <pre className="max-h-48 overflow-auto rounded-lg bg-muted p-3 text-xs break-all whitespace-pre-wrap">
        {text}
      </pre>
    </div>
  );
}
