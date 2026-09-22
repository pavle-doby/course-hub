"use client";

import { useEffect, useId, type ChangeEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon } from "lucide-react";
import { useTheme } from "next-themes";
import {
  getGetUserPreferencesQueryKey,
  useGetUserPreferences,
  useQueryClient,
  useUpdateUserPreferences,
} from "@repo/api-client";
import { UserPreferencesPutQuerySchema, type UpdateUserPreferencesReq } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingForm, useErrorHandlingQuery, useZodLocale } from "@repo/shared";
import { Alert, AlertTitle } from "@repo/ui-web/components/alert";
import { Button } from "@repo/ui-web/components/button";
import { ButtonGroup } from "@repo/ui-web/components/button-group";
import { Card, CardContent } from "@repo/ui-web/components/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui-web/components/field";
import { Skeleton } from "@repo/ui-web/components/skeleton";
import { toast } from "@repo/ui-web/components/sonner";
import { PageHeader } from "@/components/page-header";

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export default function SettingsPage() {
  const id = useId();
  const { t, i18n } = useT();
  const { setTheme } = useTheme();
  const queryClient = useQueryClient();
  useZodLocale(i18n);

  const { data: preferences, isPending, error } = useGetUserPreferences();
  const { mutate: updatePreferences } = useUpdateUserPreferences();
  useErrorHandlingQuery({
    t: t as (key: string) => string,
    error,
    showToastError: ({ title, description }) => toast.error(title, { description }),
  });
  const {
    register,
    setError,
    reset,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<UpdateUserPreferencesReq>({
    resolver: zodResolver(UserPreferencesPutQuerySchema),
  });
  const { handleErrorForm } = useErrorHandlingForm<UpdateUserPreferencesReq>({ t, i18n, setError });
  const [theme, language] = useWatch({ control, name: ["theme", "language"] });

  useEffect(() => {
    if (preferences) {
      reset(preferences);
    }
  }, [preferences, reset]);

  useEffect(() => {
    if (theme) {
      setTheme(theme);
    }
  }, [theme, setTheme]);

  useEffect(() => {
    if (language) {
      void i18n.changeLanguage(language);
    }
  }, [i18n, language]);

  function handleUpdatePreferences(data: UpdateUserPreferencesReq) {
    updatePreferences(
      { data },
      {
        onSuccess: (updatedPreferences) => {
          queryClient.setQueryData(getGetUserPreferencesQueryKey(), updatedPreferences);
          reset(updatedPreferences);
          toast.success(t("settings.updated"));
        },
        onError: (error: unknown) => {
          reset(preferences);
          handleErrorForm(error as Error);
        },
      }
    );
  }

  function handleContentBehaviorChange(event: ChangeEvent<HTMLSelectElement>) {
    handleUpdatePreferences({
      ...getValues(),
      contentBehavior: event.target.value as UpdateUserPreferencesReq["contentBehavior"],
    });
  }

  function handleEnglishLanguage() {
    setValue("language", "en");
    handleUpdatePreferences({ ...getValues(), language: "en" });
  }

  function handleSerbianLanguage() {
    setValue("language", "sr");
    handleUpdatePreferences({ ...getValues(), language: "sr" });
  }

  function handleLightTheme() {
    setValue("theme", "light");
    handleUpdatePreferences({ ...getValues(), theme: "light" });
  }

  function handleDarkTheme() {
    setValue("theme", "dark");
    handleUpdatePreferences({ ...getValues(), theme: "dark" });
  }

  function handleSystemTheme() {
    setValue("theme", "system");
    handleUpdatePreferences({ ...getValues(), theme: "system" });
  }

  if (isPending || !preferences) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader className="mb-6 hidden md:flex" title={t("settings.title")} />
        <div className="flex justify-center px-4 pt-4 pb-4 md:px-6 md:pt-0 md:pb-6">
          <Card className="w-full max-w-2xl">
            <CardContent className="flex flex-col gap-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader className="mb-6 hidden md:flex" title={t("settings.title")} />
      <div className="flex justify-center px-4 pt-4 pb-4 md:px-6 md:pt-0 md:pb-6">
        <Card className="w-full max-w-2xl">
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={`${id}-contentBehavior`}>
                  {t("settings.contentBehavior")}
                </FieldLabel>
                <select
                  id={`${id}-contentBehavior`}
                  className={selectClassName}
                  {...register("contentBehavior", { onChange: handleContentBehaviorChange })}
                >
                  <option value="create">{t("settings.contentBehaviorCreate")}</option>
                  <option value="consume">{t("settings.contentBehaviorConsume")}</option>
                  <option value="both">{t("settings.contentBehaviorBoth")}</option>
                </select>
                <FieldError errors={[errors.contentBehavior]} />
              </Field>

              <Field>
                <FieldLabel>{t("settings.theme")}</FieldLabel>
                <ButtonGroup className="w-full md:w-fit" aria-label={t("settings.theme")}>
                  <Button
                    className="flex-1 md:w-30 md:flex-none"
                    type="button"
                    variant={theme === "light" ? "default" : "outline"}
                    aria-pressed={theme === "light"}
                    onClick={handleLightTheme}
                  >
                    {t("settings.themeLight")}
                  </Button>
                  <Button
                    className="flex-1 md:w-30 md:flex-none"
                    type="button"
                    variant={theme === "dark" ? "default" : "outline"}
                    aria-pressed={theme === "dark"}
                    onClick={handleDarkTheme}
                  >
                    {t("settings.themeDark")}
                  </Button>
                  <Button
                    className="flex-1 md:w-30 md:flex-none"
                    type="button"
                    variant={theme === "system" ? "default" : "outline"}
                    aria-pressed={theme === "system"}
                    onClick={handleSystemTheme}
                  >
                    {t("settings.themeSystem")}
                  </Button>
                </ButtonGroup>
                <FieldError errors={[errors.theme]} />
              </Field>

              <Field>
                <FieldLabel>{t("settings.language")}</FieldLabel>
                <ButtonGroup className="w-full md:w-fit" aria-label={t("settings.language")}>
                  <Button
                    className="flex-1 md:w-30 md:flex-none"
                    type="button"
                    variant={language === "en" ? "default" : "outline"}
                    aria-pressed={language === "en"}
                    onClick={handleEnglishLanguage}
                  >
                    {t("settings.languageEnglish")}
                  </Button>
                  <Button
                    className="flex-1 md:w-30 md:flex-none"
                    type="button"
                    variant={language === "sr" ? "default" : "outline"}
                    aria-pressed={language === "sr"}
                    onClick={handleSerbianLanguage}
                  >
                    {t("settings.languageSerbian")}
                  </Button>
                </ButtonGroup>
                <FieldError errors={[errors.language]} />
              </Field>

              {errors.root && (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>{errors.root.message}</AlertTitle>
                </Alert>
              )}
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
