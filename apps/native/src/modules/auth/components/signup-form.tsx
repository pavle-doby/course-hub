import { View } from "react-native";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useColorScheme } from "nativewind";
import { z } from "zod";
import { useAuthSignUp } from "@repo/api-client";
import { AuthSignUpQuerySchema } from "@repo/contract";
import { useTranslation, type TFunction } from "@repo/i18n/native";
import { useErrorHandlingForm, useZodLocale } from "@repo/shared";
import { Button } from "@repo/ui-native/components/button";
import { Card, CardContent } from "@repo/ui-native/components/card";
import { FieldGroup } from "@repo/ui-native/components/field";
import { Text } from "@repo/ui-native/components/text";
import { ChoiceButtons, FormInput, FormRootError } from "@/components/form";
import { useApplyPreferences } from "@/hooks/use-apply-preferences";
import { useAuth } from "@/providers/auth-provider";
import { deviceLocale } from "@/utils/device-locale";

const createSignupFormSchema = (t: TFunction) =>
  AuthSignUpQuerySchema.extend({
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("auth.signup.passwordsMismatch"),
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<ReturnType<typeof createSignupFormSchema>>;

export function SignupForm() {
  const { t, i18n } = useTranslation();
  useZodLocale(i18n);

  const { signIn } = useAuth();
  const { colorScheme = "light" } = useColorScheme();
  const applyPreferences = useApplyPreferences();
  const { mutate: signupMutate, isPending } = useAuthSignUp();

  const {
    control,
    handleSubmit,
    setError,
    getValues,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(createSignupFormSchema(t)),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      language: deviceLocale,
      theme: colorScheme,
    },
  });

  const { handleErrorForm } = useErrorHandlingForm<SignupFormData>({ t, i18n, setError });

  function onSubmit({ firstName, lastName, email, password, language, theme }: SignupFormData) {
    signupMutate(
      { data: { firstName, lastName, email, password, language, theme } },
      {
        onSuccess: ({ accessToken, refreshToken }) => void signIn({ accessToken, refreshToken }),
        onError: (error: unknown) => handleErrorForm(error as Error),
      }
    );
  }

  return (
    <>
      <Card>
        <CardContent className="gap-6 pt-6">
          <Text variant="h3">{t("auth.signup.title")}</Text>
          <FieldGroup>
            <FormInput
              control={control}
              name="firstName"
              label={t("auth.signup.firstNameLabel")}
              placeholder={t("auth.signup.firstNamePlaceholder")}
              autoComplete="given-name"
            />
            <FormInput
              control={control}
              name="lastName"
              label={t("auth.signup.lastNameLabel")}
              placeholder={t("auth.signup.lastNamePlaceholder")}
              autoComplete="family-name"
            />
            <FormInput
              control={control}
              name="email"
              label={t("auth.signup.emailLabel")}
              placeholder={t("auth.signup.emailPlaceholder")}
              autoComplete="email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FormInput
              control={control}
              name="password"
              label={t("auth.signup.passwordLabel")}
              placeholder={t("auth.signup.passwordPlaceholder")}
              autoComplete="new-password"
              password
            />
            <FormInput
              control={control}
              name="confirmPassword"
              label={t("auth.signup.confirmPasswordLabel")}
              placeholder={t("auth.signup.passwordPlaceholder")}
              autoComplete="new-password"
              password
            />
            <Controller
              control={control}
              name="language"
              render={({ field: { value, onChange } }) => (
                <ChoiceButtons
                  label={t("auth.signup.languageLabel")}
                  value={value}
                  options={[
                    { value: "en", label: t("auth.signup.languageEnglish") },
                    { value: "sr", label: t("auth.signup.languageSerbian") },
                  ]}
                  onChange={(language) => {
                    onChange(language);
                    applyPreferences({ language, theme: getValues("theme") });
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="theme"
              render={({ field: { value, onChange } }) => (
                <ChoiceButtons
                  label={t("auth.signup.themeLabel")}
                  value={value}
                  options={[
                    { value: "dark", label: t("auth.signup.themeDark") },
                    { value: "light", label: t("auth.signup.themeLight") },
                  ]}
                  onChange={(theme) => {
                    onChange(theme);
                    applyPreferences({ language: getValues("language"), theme });
                  }}
                />
              )}
            />
            <FormRootError message={errors.root?.message} />
            <Button disabled={isPending} onPress={handleSubmit(onSubmit)}>
              <Text>{t("auth.signup.submit")}</Text>
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>
      <View className="flex-row items-center gap-2">
        <Text variant="muted">{t("auth.signup.hasAccount")}</Text>
        <Link href="/login" asChild>
          <Button variant="outline" size="sm">
            <Text>{t("auth.signup.logIn")}</Text>
          </Button>
        </Link>
      </View>
    </>
  );
}
