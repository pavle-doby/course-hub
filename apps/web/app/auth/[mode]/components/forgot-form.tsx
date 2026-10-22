"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, MailCheckIcon } from "lucide-react";
import { useAuthForgotPassword } from "@repo/api-client";
import { AuthForgotPasswordQuerySchema, type AuthForgotPasswordReq } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingForm, useZodLocale } from "@repo/shared";
import { Card, CardContent } from "@repo/ui-web/components/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui-web/components/field";
import { Input } from "@repo/ui-web/components/input";
import { Alert, AlertTitle } from "@repo/ui-web/components/alert";
import { Button } from "@repo/ui-web/components/button";
import { cn } from "@repo/ui-web/lib/utils";

export function ForgotForm({ className, ...props }: React.ComponentProps<"div">) {
  const id = useId();
  const { t, i18n } = useT();
  useZodLocale(i18n);

  const [sentTo, setSentTo] = useState<string | null>(null);

  const { mutate: forgotMutate, isPending } = useAuthForgotPassword();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AuthForgotPasswordReq>({
    resolver: zodResolver(AuthForgotPasswordQuerySchema),
  });

  const { handleErrorForm } = useErrorHandlingForm<AuthForgotPasswordReq>({
    t,
    i18n,
    setError,
  });

  function onSubmit(data: AuthForgotPasswordReq) {
    forgotMutate(
      { data },
      {
        onSuccess: () => {
          setSentTo(data.email);
        },
        onError: (error: unknown) => {
          handleErrorForm(error as Error);
        },
      }
    );
  }

  function handleResend() {
    if (sentTo) {
      onSubmit({ email: sentTo });
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardContent className="flex flex-col gap-6 pt-6">
          {sentTo ? (
            <div className="flex flex-col gap-4">
              <MailCheckIcon className="size-10 text-primary" />
              <h1 className="text-3xl font-bold">{t("auth.forgot.successTitle")}</h1>
              <p className="text-sm text-muted-foreground">
                {t("auth.forgot.successMessage", { email: sentTo })}
              </p>
              <Button
                variant="outline"
                className="w-full"
                disabled={isPending}
                onClick={handleResend}
              >
                {isPending ? t("auth.forgot.submitting") : t("auth.forgot.resend")}
              </Button>
              {errors.root && (
                <Alert variant="destructive" className="max-w-md">
                  <AlertCircleIcon />
                  <AlertTitle>{errors.root.message}</AlertTitle>
                </Alert>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">{t("auth.forgot.title")}</h1>
                <p className="text-sm text-muted-foreground">{t("auth.forgot.info")}</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor={`${id}-email`}>{t("auth.forgot.emailLabel")}</FieldLabel>
                    <Input
                      id={`${id}-email`}
                      type="email"
                      placeholder={t("auth.forgot.emailPlaceholder")}
                      autoComplete="email"
                      {...register("email")}
                    />
                    <FieldError errors={[errors.email]} />
                  </Field>
                  {errors.root && (
                    <Alert variant="destructive" className="max-w-md">
                      <AlertCircleIcon />
                      <AlertTitle>{errors.root.message}</AlertTitle>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? t("auth.forgot.submitting") : t("auth.forgot.submit")}
                  </Button>
                </FieldGroup>
              </form>
            </>
          )}
        </CardContent>
      </Card>
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">{t("auth.forgot.rememberPassword")}</p>
        <Link href="/auth/login" className="rounded-md border px-4 py-2 text-sm font-semibold">
          {t("auth.forgot.logIn")}
        </Link>
      </div>
    </div>
  );
}
