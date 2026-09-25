"use client";

import { useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateEmailInvitation,
  useCreateInviteLink,
  useRevokeInvitation,
  getGetCourseInvitationsQueryKey,
  useQueryClient,
} from "@repo/api-client";
import { CreateEmailInvitationBodySchema, type CreateEmailInvitationReq } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingAction, useErrorHandlingForm, useZodLocale } from "@repo/shared";
import { Button } from "@repo/ui-web/components/button";
import { Field, FieldError, FieldLabel } from "@repo/ui-web/components/field";
import { Input } from "@repo/ui-web/components/input";
import { Separator } from "@repo/ui-web/components/separator";
import { toast } from "@repo/ui-web/components/sonner";
import { LinkIcon as LinkIcon, MailIcon } from "lucide-react";
import { InvitesList } from "./invites-list";

type InviteFormProps = {
  publicId: string;
};

function inviteUrl(token: string) {
  return `${window.location.origin}/invite/${token}`;
}

export function InviteForm({ publicId }: InviteFormProps) {
  const id = useId();
  const { t, i18n } = useT();
  useZodLocale(i18n);
  const queryClient = useQueryClient();
  const { handleErrorAction } = useErrorHandlingAction({
    t: t as (key: string) => string,
    showToastError: ({ title, description }) => toast.error(title, { description }),
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateEmailInvitationReq>({
    resolver: zodResolver(CreateEmailInvitationBodySchema),
  });

  const { handleErrorForm } = useErrorHandlingForm<CreateEmailInvitationReq>({
    t,
    i18n,
    setError,
  });

  const queryKey = getGetCourseInvitationsQueryKey({ publicId });

  const { mutateAsync: createEmailInvitation, isPending: isCreatingEmail } =
    useCreateEmailInvitation();
  const { mutateAsync: createInviteLink, isPending: isCreatingLink } = useCreateInviteLink();
  const { mutateAsync: revokeInvitation } = useRevokeInvitation();

  async function copyToClipboard(token: string) {
    await navigator.clipboard.writeText(inviteUrl(token));
    toast.success(t("invite.dialog.copiedToast"));
  }

  async function handleCreateEmailInvite(data: CreateEmailInvitationReq) {
    try {
      const invitation = await createEmailInvitation({ pathParams: { publicId }, data });
      await queryClient.invalidateQueries({ queryKey });
      reset();
      toast.success(t("invite.dialog.createdToast"));
      await copyToClipboard(invitation.token);
    } catch (error) {
      handleErrorForm(error as Error);
    }
  }

  async function handleCreateLinkInvite() {
    try {
      const invitation = await createInviteLink({ pathParams: { publicId } });
      await queryClient.invalidateQueries({ queryKey });
      toast.success(t("invite.dialog.createdToast"));
      await copyToClipboard(invitation.token);
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleRevoke(invitationId: string) {
    try {
      await revokeInvitation({ pathParams: { id: invitationId } });
      await queryClient.invalidateQueries({ queryKey });
      toast.success(t("invite.dialog.revokedToast"));
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-medium">{t("invite.dialog.title")}</h3>
        <p className="text-sm text-muted-foreground">{t("invite.dialog.description")}</p>
      </div>

      <Separator className="-mx-4 !w-auto" />

      <Field>
        <FieldLabel htmlFor={`${id}-email`}>{t("invite.dialog.emailLabel")}</FieldLabel>
        <form onSubmit={handleSubmit(handleCreateEmailInvite)} noValidate>
          <div className="flex flex-col gap-2 md:flex-row">
            <Input
              id={`${id}-email`}
              type="email"
              className="md:flex-1"
              placeholder={t("invite.dialog.emailPlaceholder")}
              {...register("email")}
            />
            <Button type="submit" className="w-full md:w-auto" disabled={isCreatingEmail}>
              <MailIcon /> {t("invite.dialog.sendEmailInvite")}
            </Button>
          </div>
        </form>
        <FieldError errors={[errors.email ?? errors.root]} />
      </Field>

      <Separator className="-mx-4 !w-auto" />

      <Button variant="outline" onClick={handleCreateLinkInvite} disabled={isCreatingLink}>
        <LinkIcon /> {t("invite.dialog.generateLink")}
      </Button>

      <Separator className="-mx-4 !w-auto" />

      <InvitesList publicId={publicId} onCopy={copyToClipboard} onRevoke={handleRevoke} />
    </div>
  );
}
