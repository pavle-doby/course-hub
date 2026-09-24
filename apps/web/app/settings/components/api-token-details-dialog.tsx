"use client";

import { useId } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { ApiToken } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui-web/components/dialog";
import { Field, FieldLabel } from "@repo/ui-web/components/field";
import { Input } from "@repo/ui-web/components/input";
import { MCP_TOKEN_PLACEHOLDER } from "@/utils/consts";
import { McpConfigSnippets } from "./mcp-config-snippets";

type ApiTokenDetailsDialogProps = {
  token: ApiToken | undefined;
  onOpenChange: (open: boolean) => void;
};

type TokenForm = { token: string };

export function ApiTokenDetailsDialog({ token, onOpenChange }: ApiTokenDetailsDialogProps) {
  const id = useId();
  const { t } = useT();
  // Only fills in the snippets locally; never sent anywhere
  const { register, reset, control } = useForm<TokenForm>({ defaultValues: { token: "" } });
  const enteredToken = useWatch({ control, name: "token" }).trim();

  function handleOpenChange(open: boolean) {
    if (!open) {
      reset();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={!!token} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{token?.name}</DialogTitle>
          <DialogDescription>{t("settings.aiAccess.detailsDialog.description")}</DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor={`${id}-token`}>
            {t("settings.aiAccess.createDialog.token")}
          </FieldLabel>
          <Input
            id={`${id}-token`}
            autoComplete="off"
            spellCheck={false}
            placeholder={token && `${token.tokenPrefix}…`}
            {...register("token")}
          />
        </Field>
        <McpConfigSnippets token={enteredToken || MCP_TOKEN_PLACEHOLDER} showToken={false} />
      </DialogContent>
    </Dialog>
  );
}
