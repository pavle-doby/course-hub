"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon } from "lucide-react";
import {
  getGetApiTokensQueryKey,
  useCreateApiToken,
  useQueryClient,
  type CreatedApiToken,
} from "@repo/api-client";
import { CreateApiTokenBodySchema, type CreateApiTokenReq } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingForm, useZodLocale } from "@repo/shared";
import { Alert, AlertTitle } from "@repo/ui-web/components/alert";
import { Button } from "@repo/ui-web/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui-web/components/dialog";
import { Field, FieldError, FieldLabel } from "@repo/ui-web/components/field";
import { Input } from "@repo/ui-web/components/input";
import { McpConfigSnippets } from "./mcp-config-snippets";

type CreateApiTokenDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateApiTokenDialog({ open, onOpenChange }: CreateApiTokenDialogProps) {
  const id = useId();
  const { t, i18n } = useT();
  useZodLocale(i18n);
  const queryClient = useQueryClient();
  const [created, setCreated] = useState<CreatedApiToken>();
  const { mutateAsync: createToken, isPending } = useCreateApiToken();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateApiTokenReq>({ resolver: zodResolver(CreateApiTokenBodySchema) });
  const { handleErrorForm } = useErrorHandlingForm<CreateApiTokenReq>({ t, i18n, setError });

  async function handleCreate(data: CreateApiTokenReq) {
    try {
      setCreated(await createToken({ data }));
      await queryClient.invalidateQueries({ queryKey: getGetApiTokensQueryKey() });
    } catch (error) {
      handleErrorForm(error as Error);
    }
  }

  // The plaintext token is dropped on close, so it's only ever shown once
  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setCreated(undefined);
      reset();
    }
    onOpenChange(nextOpen);
  }

  function handleDone() {
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("settings.aiAccess.createDialog.createdTitle")}</DialogTitle>
              <DialogDescription>
                {t("settings.aiAccess.createDialog.createdDescription")}
              </DialogDescription>
            </DialogHeader>
            <McpConfigSnippets token={created.token} />
            <DialogFooter>
              <Button type="button" onClick={handleDone}>
                {t("settings.aiAccess.createDialog.done")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit(handleCreate)} noValidate className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>{t("settings.aiAccess.createDialog.title")}</DialogTitle>
              <DialogDescription>
                {t("settings.aiAccess.createDialog.description")}
              </DialogDescription>
            </DialogHeader>
            <Field>
              <FieldLabel htmlFor={`${id}-name`}>
                {t("settings.aiAccess.createDialog.nameLabel")}
              </FieldLabel>
              <Input
                id={`${id}-name`}
                placeholder={t("settings.aiAccess.createDialog.namePlaceholder")}
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>
            {errors.root && (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>{errors.root.message}</AlertTitle>
              </Alert>
            )}
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {t("settings.aiAccess.createDialog.submit")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
