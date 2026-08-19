"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { TFunction } from "@repo/i18n";
import { AlertCircleIcon, Eye, EyeOff } from "lucide-react";
import { useAuthSignUp } from "@repo/api-client";
import { AuthSignUpQuerySchema } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingForm, useZodLocale } from "@repo/shared";
import { Card, CardContent } from "@repo/ui-web/components/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui-web/components/field";
import { Input } from "@repo/ui-web/components/input";
import { Alert, AlertTitle } from "@repo/ui-web/components/alert";
import { Button } from "@repo/ui-web/components/button";
import { cn } from "@repo/ui-web/lib/utils";

const createSignupFormSchema = (t: TFunction) =>
  AuthSignUpQuerySchema.extend({
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("auth.signup.passwordsMismatch"),
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<ReturnType<typeof createSignupFormSchema>>;

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const id = useId();
  const router = useRouter();

  const { t, i18n } = useT();
  useZodLocale(i18n);

  const SignupFormSchema = createSignupFormSchema(t);
  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: signupMutate, isPending } = useAuthSignUp();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(SignupFormSchema),
  });

  const { handleErrorForm } = useErrorHandlingForm<SignupFormData>({
    t,
    i18n,
    setError,
  });

  function onSubmit(formData: SignupFormData) {
    const { firstName, lastName, email, password } = formData;
    signupMutate(
      { data: { firstName, lastName, email, password } },
      {
        onSuccess: () => {
          router.replace("/");
        },
        onError: (error: unknown) => {
          handleErrorForm(error as Error);
        },
      }
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardContent className="flex flex-col gap-6 pt-6">
          <h1 className="text-3xl font-bold">{t("auth.signup.title")}</h1>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor={`${id}-first-name`}>
                    {t("auth.signup.firstNameLabel")}
                  </FieldLabel>
                  <Input
                    id={`${id}-first-name`}
                    type="text"
                    placeholder={t("auth.signup.firstNamePlaceholder")}
                    autoComplete="given-name"
                    {...register("firstName")}
                  />
                  <FieldError errors={[errors.firstName]} />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${id}-last-name`}>
                    {t("auth.signup.lastNameLabel")}
                  </FieldLabel>
                  <Input
                    id={`${id}-last-name`}
                    type="text"
                    placeholder={t("auth.signup.lastNamePlaceholder")}
                    autoComplete="family-name"
                    {...register("lastName")}
                  />
                  <FieldError errors={[errors.lastName]} />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor={`${id}-email`}>{t("auth.signup.emailLabel")}</FieldLabel>
                <Input
                  id={`${id}-email`}
                  type="email"
                  placeholder={t("auth.signup.emailPlaceholder")}
                  autoComplete="email"
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${id}-password`}>{t("auth.signup.passwordLabel")}</FieldLabel>
                <div className="relative">
                  <Input
                    className="pr-10"
                    id={`${id}-password`}
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.signup.passwordPlaceholder")}
                    autoComplete="new-password"
                    {...register("password")}
                  />
                  <button
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? t("auth.signup.hidePassword") : t("auth.signup.showPassword")
                    }
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <FieldError errors={[errors.password]} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${id}-confirm-password`}>
                  {t("auth.signup.confirmPasswordLabel")}
                </FieldLabel>
                <div className="relative">
                  <Input
                    className="pr-10"
                    id={`${id}-confirm-password`}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("auth.signup.passwordPlaceholder")}
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                  />
                  <button
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={
                      showConfirmPassword
                        ? t("auth.signup.hidePassword")
                        : t("auth.signup.showPassword")
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
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
                {isPending ? "Creating account…" : t("auth.signup.submit")}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">{t("auth.signup.hasAccount")}</p>
        <Link href="/auth/login" className="rounded-md border px-4 py-2 text-sm font-semibold">
          {t("auth.signup.logIn")}
        </Link>
      </div>
    </div>
  );
}
