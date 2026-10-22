"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { TFunction } from "@repo/i18n";
import { AlertCircleIcon, CircleCheckIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useAuthResetPassword } from "@repo/api-client";
import { AuthResetPasswordQuerySchema } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingForm, useZodLocale } from "@repo/shared";
import { Card, CardContent } from "@repo/ui-web/components/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui-web/components/field";
import { Input } from "@repo/ui-web/components/input";
import { Alert, AlertTitle } from "@repo/ui-web/components/alert";
import { Button } from "@repo/ui-web/components/button";
import { cn } from "@repo/ui-web/lib/utils";
import { AuthStatusCard } from "./auth-status-card";

// tokenHash comes from the URL, so the form only collects the passwords
const createResetFormSchema = (t: TFunction) =>
  AuthResetPasswordQuerySchema.pick({ password: true })
    .extend({
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.reset.passwordsMismatch"),
      path: ["confirmPassword"],
    });

type ResetFormData = z.infer<ReturnType<typeof createResetFormSchema>>;

export function ResetForm({ className, ...props }: React.ComponentProps<"div">) {
  const id = useId();
  const searchParams = useSearchParams();
  const tokenHash = searchParams.get("token_hash");

  const { t, i18n } = useT();
  useZodLocale(i18n);

  const ResetFormSchema = createResetFormSchema(t);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const { mutate: resetMutate, isPending } = useAuthResetPassword();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(ResetFormSchema),
  });

  const { handleErrorForm } = useErrorHandlingForm<ResetFormData>({
    t,
    i18n,
    setError,
  });

  function handleTogglePassword() {
    setShowPassword((v) => !v);
  }

  function handleToggleConfirmPassword() {
    setShowConfirmPassword((v) => !v);
  }

  function onSubmit({ password }: ResetFormData) {
    if (!tokenHash) {
      return;
    }

    resetMutate(
      { data: { tokenHash, password } },
      {
        onSuccess: () => {
          setIsDone(true);
        },
        onError: (error: unknown) => {
          handleErrorForm(error as Error);
        },
      }
    );
  }

  if (!tokenHash) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <AuthStatusCard
          icon={AlertCircleIcon}
          iconClassName="text-destructive"
          title={t("auth.reset.invalidLinkTitle")}
          message={t("auth.reset.invalidLinkMessage")}
          linkHref="/auth/forgot"
          linkLabel={t("auth.reset.requestNewLink")}
        />
      </div>
    );
  }

  if (isDone) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <AuthStatusCard
          icon={CircleCheckIcon}
          title={t("auth.reset.successTitle")}
          message={t("auth.reset.successMessage")}
          linkHref="/auth/login"
          linkLabel={t("auth.reset.goToLogin")}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardContent className="flex flex-col gap-6 pt-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">{t("auth.reset.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("auth.reset.info")}</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={`${id}-password`}>{t("auth.reset.passwordLabel")}</FieldLabel>
                <div className="relative">
                  <Input
                    className="pr-10"
                    id={`${id}-password`}
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.reset.passwordPlaceholder")}
                    autoComplete="new-password"
                    {...register("password")}
                  />
                  <button
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                    type="button"
                    onClick={handleTogglePassword}
                    aria-label={
                      showPassword ? t("auth.reset.hidePassword") : t("auth.reset.showPassword")
                    }
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </button>
                </div>
                <FieldError errors={[errors.password]} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${id}-confirm-password`}>
                  {t("auth.reset.confirmPasswordLabel")}
                </FieldLabel>
                <div className="relative">
                  <Input
                    className="pr-10"
                    id={`${id}-confirm-password`}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("auth.reset.passwordPlaceholder")}
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                  />
                  <button
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                    type="button"
                    onClick={handleToggleConfirmPassword}
                    aria-label={
                      showConfirmPassword
                        ? t("auth.reset.hidePassword")
                        : t("auth.reset.showPassword")
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </button>
                </div>
                <FieldError errors={[errors.confirmPassword]} />
              </Field>
              {errors.root && (
                <Alert variant="destructive" className="max-w-md">
                  <AlertCircleIcon />
                  <AlertTitle>{errors.root.message}</AlertTitle>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? t("auth.reset.submitting") : t("auth.reset.submit")}
              </Button>
              <Link
                href="/auth/forgot"
                className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                {t("auth.reset.requestNewLink")}
              </Link>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
