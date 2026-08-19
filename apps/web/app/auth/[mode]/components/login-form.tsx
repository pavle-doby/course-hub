"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, Eye, EyeOff } from "lucide-react";
import { useAuthLogin } from "@repo/api-client";
import { AuthLoginQuerySchema, type AuthLogInUserReq } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingForm, useZodLocale } from "@repo/shared";
import { Card, CardContent } from "@repo/ui-web/components/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui-web/components/field";
import { Input } from "@repo/ui-web/components/input";
import { Alert, AlertTitle } from "@repo/ui-web/components/alert";
import { Button } from "@repo/ui-web/components/button";
import { Separator } from "@repo/ui-web/components/separator";
import { cn } from "@repo/ui-web/lib/utils";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const id = useId();
  const router = useRouter();

  const { t, i18n } = useT();
  useZodLocale(i18n);

  const [showPassword, setShowPassword] = useState(false);

  const { mutate: loginMutate, isPending } = useAuthLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AuthLogInUserReq>({
    resolver: zodResolver(AuthLoginQuerySchema),
  });

  const { handleErrorForm } = useErrorHandlingForm<AuthLogInUserReq>({
    t,
    i18n,
    setError,
  });

  function onSubmit(data: AuthLogInUserReq) {
    loginMutate(
      { data },
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
          <h1 className="text-3xl font-bold">{t("auth.login.title")}</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={`${id}-email`}>{t("auth.login.emailLabel")}</FieldLabel>
                <Input
                  id={`${id}-email`}
                  type="email"
                  placeholder={t("auth.login.emailPlaceholder")}
                  autoComplete="email"
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${id}-password`}>{t("auth.login.passwordLabel")}</FieldLabel>
                <div className="relative">
                  <Input
                    className="pr-10"
                    id={`${id}-password`}
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.login.passwordPlaceholder")}
                    autoComplete="current-password"
                    {...register("password")}
                  />
                  <button
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? t("auth.login.hidePassword") : t("auth.login.showPassword")
                    }
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <FieldError errors={[errors.password]} />
                <Link href="/auth/forgot" className="text-sm">
                  {t("auth.login.forgotPassword")} <strong>{t("auth.login.resetPassword")}</strong>
                </Link>
              </Field>
              {errors.root && (
                <Alert variant="destructive" className="max-w-md">
                  <AlertCircleIcon />
                  <AlertTitle>{errors.root.message}</AlertTitle>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Logging in…" : t("auth.login.submit")}
              </Button>
            </FieldGroup>
          </form>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>
          <Button variant="outline" className="w-full gap-2" type="button">
            <GoogleIcon />
            {t("auth.login.loginWithGoogle")}
          </Button>
        </CardContent>
      </Card>
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">{t("auth.login.noAccount")}</p>
        <Link href="/auth/signup" className="rounded-md border px-4 py-2 text-sm font-semibold">
          {t("auth.login.signUp")}
        </Link>
      </div>
    </div>
  );
}

// TODO: Think of moving this to some reusable place
function GoogleIcon() {
  return (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <title>Google</title>
      <path
        fill="white"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
      />
    </svg>
  );
}
