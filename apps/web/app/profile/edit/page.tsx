"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon } from "lucide-react";
import { useAuthSignOut, useDeleteUser, useGetUserSelf, useUpdateUser } from "@repo/api-client";
import { UserPutQuerySchema } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingForm, useErrorHandlingQuery, useZodLocale } from "@repo/shared";
import { Alert, AlertTitle } from "@repo/ui-web/components/alert";
import { Card, CardContent } from "@repo/ui-web/components/card";
import { AlertDialogTrigger } from "@repo/ui-web/components/alert-dialog";
import { Button } from "@repo/ui-web/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui-web/components/field";
import { Input } from "@repo/ui-web/components/input";
import { Skeleton } from "@repo/ui-web/components/skeleton";
import { Textarea } from "@repo/ui-web/components/textarea";
import { toast } from "@repo/ui-web/components/sonner";
import { ProfileAvatar } from "@/app/profile/components/profile-avatar";
import { ChAlertDialog } from "@/components/ch-alert-dialog";
import { PageHeader } from "@/components/page-header";

// drizzle-zod's createUpdateSchema infers field types as `never` with the
// currently installed drizzle-zod/zod versions, so the form values are typed
// explicitly here and the resolver is cast (documented workaround).
type ProfileFormValues = {
  username: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
};

export default function ProfileEditPage() {
  const id = useId();
  const router = useRouter();
  const { t, i18n } = useT();
  useZodLocale(i18n);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: user, isPending, error } = useGetUserSelf();

  const { handleErrorAction } = useErrorHandlingQuery({
    t: t as (key: string) => string,
    error,
    showToastError: ({ title, description }) => toast.error(title, { description }),
  });
  const { mutate: updateUser, isPending: isSaving } = useUpdateUser();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { mutate: signOut } = useAuthSignOut();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(UserPutQuerySchema) as unknown as Resolver<ProfileFormValues>,
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
      });
    }
  }, [user, reset]);

  const { handleErrorForm } = useErrorHandlingForm<ProfileFormValues>({ t, i18n, setError });

  function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    updateUser(
      { pathParams: { id: user.id }, data },
      {
        onSuccess: () => router.back(),
        onError: (error: unknown) => handleErrorForm(error as Error),
      }
    );
  }

  function onDelete() {
    if (!user) return;
    deleteUser(
      { pathParams: { id: user.id } },
      {
        onSuccess: () =>
          signOut(undefined, {
            onSuccess: () => router.push("/auth/login"),
            onError: (err: unknown) => handleErrorAction(err),
          }),
        onError: (err: unknown) => handleErrorAction(err),
      }
    );
  }

  if (isPending || !user) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader className="mb-6 hidden md:flex" title={t("profile.edit.title")} />
        <div className="flex justify-center px-4 pt-4 pb-4 md:px-6 md:pt-0 md:pb-6">
          <Card className="w-full max-w-2xl">
            <CardContent className="flex flex-col gap-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="size-22 rounded-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader className="mb-6 hidden md:flex" title={t("profile.edit.title")} />
      <div className="flex justify-center px-4 pt-4 pb-4 md:px-6 md:pt-0 md:pb-6">
        <Card className="w-full max-w-2xl">
          <CardContent>
            <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <div className="flex items-center gap-4">
                  <ProfileAvatar avatarUrl={user.avatarUrl} username={user.username} />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => alert(t("profile.edit.changePhoto"))}
                  >
                    {t("profile.edit.changePhoto")}
                  </Button>
                </div>

                <Field>
                  <FieldLabel htmlFor={`${id}-firstName`}>{t("profile.edit.firstName")}</FieldLabel>
                  <Input id={`${id}-firstName`} {...register("firstName")} />
                  <FieldError errors={[errors.firstName]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor={`${id}-lastName`}>{t("profile.edit.lastName")}</FieldLabel>
                  <Input id={`${id}-lastName`} {...register("lastName")} />
                  <FieldError errors={[errors.lastName]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor={`${id}-username`}>{t("profile.edit.username")}</FieldLabel>
                  <Input id={`${id}-username`} autoCapitalize="none" {...register("username")} />
                  <FieldError errors={[errors.username]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor={`${id}-bio`}>{t("profile.edit.description")}</FieldLabel>
                  <Textarea id={`${id}-bio`} rows={4} {...register("bio")} />
                  <FieldError errors={[errors.bio]} />
                </Field>

                {errors.root && (
                  <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>{errors.root.message}</AlertTitle>
                  </Alert>
                )}
              </FieldGroup>

              <div className="flex gap-3">
                <ChAlertDialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                  title={t("profile.edit.deleteConfirmTitle")}
                  description={t("profile.edit.deleteConfirmMessage")}
                  cancelLabel={t("profile.edit.cancel")}
                  actionLabel={t("profile.edit.delete")}
                  actionProps={{ variant: "destructive", onClick: onDelete }}
                >
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" disabled={isDeleting}>
                      {t("profile.edit.delete")}
                    </Button>
                  </AlertDialogTrigger>
                </ChAlertDialog>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  {t("profile.edit.cancel")}
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {t("profile.edit.save")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
