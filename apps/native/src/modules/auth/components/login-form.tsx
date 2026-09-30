import { View } from "react-native";
import { Link, useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthLogin } from "@repo/api-client";
import { AuthLoginQuerySchema, type AuthLogInUserReq } from "@repo/contract";
import { useTranslation } from "@repo/i18n/native";
import { useErrorHandlingForm, useZodLocale } from "@repo/shared";
import { Button } from "@repo/ui-native/components/button";
import { Card, CardContent } from "@repo/ui-native/components/card";
import { FieldGroup } from "@repo/ui-native/components/field";
import { Text } from "@repo/ui-native/components/text";
import { FormInput, FormRootError } from "@/components/form";
import { useApplyPreferences } from "@/hooks/use-apply-preferences";
import { useAuth } from "@/providers/auth-provider";

export function LoginForm() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  // Only in-app paths, never absolute URLs or `//host` / `/\\host`
  const nextPath = next && /^\/(?![/\\])/.test(next) ? next : null;

  const { t, i18n } = useTranslation();
  useZodLocale(i18n);

  const { signIn } = useAuth();
  const applyPreferences = useApplyPreferences();
  const { mutate: loginMutate, isPending } = useAuthLogin();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AuthLogInUserReq>({
    resolver: zodResolver(AuthLoginQuerySchema),
    defaultValues: { email: "", password: "" },
  });

  const { handleErrorForm } = useErrorHandlingForm<AuthLogInUserReq>({ t, i18n, setError });

  function onSubmit(data: AuthLogInUserReq) {
    loginMutate(
      { data },
      {
        onSuccess: async ({ accessToken, refreshToken, preferences }) => {
          applyPreferences(preferences);
          await signIn({ accessToken, refreshToken });
          if (nextPath) {
            router.replace(nextPath as Href);
          }
        },
        onError: (error: unknown) => handleErrorForm(error as Error),
      }
    );
  }

  return (
    <>
      <Card>
        <CardContent className="gap-6 pt-6">
          <Text variant="h3">{t("auth.login.title")}</Text>
          <FieldGroup>
            <FormInput
              control={control}
              name="email"
              label={t("auth.login.emailLabel")}
              placeholder={t("auth.login.emailPlaceholder")}
              autoComplete="email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FormInput
              control={control}
              name="password"
              label={t("auth.login.passwordLabel")}
              placeholder={t("auth.login.passwordPlaceholder")}
              autoComplete="current-password"
              password
              onSubmitEditing={handleSubmit(onSubmit)}
            />
            <FormRootError message={errors.root?.message} />
            <Button disabled={isPending} onPress={handleSubmit(onSubmit)}>
              <Text>{t("auth.login.submit")}</Text>
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>
      <View className="flex-row items-center gap-2">
        <Text variant="muted">{t("auth.login.noAccount")}</Text>
        <Link href="/signup" asChild>
          <Button variant="outline" size="sm">
            <Text>{t("auth.login.signUp")}</Text>
          </Button>
        </Link>
      </View>
    </>
  );
}
