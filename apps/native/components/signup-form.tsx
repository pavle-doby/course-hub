import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { useAuthNativeSignUp } from '@repo/api-client';
import { AuthSignUpQuerySchema } from '@repo/contract';
import { useTranslation } from '@repo/i18n/native';
import { useErrorHandlingForm, useZodLocale } from '@repo/shared';
import { Alert, AlertTitle } from '@repo/ui-native/components/alert';
import { Button } from '@repo/ui-native/components/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@repo/ui-native/components/field';
import { Icon } from '@repo/ui-native/components/icon';
import { Input } from '@repo/ui-native/components/input';
import { Text } from '@repo/ui-native/components/text';
import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';
import { saveTokens } from '@/app/utils/tokenStorage';
import { useAuth } from '@/app/providers/AuthProvider';

export function SignupForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { t, i18n } = useTranslation();
  useZodLocale(i18n);

  const schema = useMemo(
    () =>
      AuthSignUpQuerySchema.extend({ confirmPassword: z.string() }).refine(
        (d) => d.password === d.confirmPassword,
        { message: t('auth.signup.passwordsMismatch'), path: ['confirmPassword'] }
      ),
    [t]
  );

  type FormData = z.infer<typeof schema>;

  // Route types are generated on first `expo start`; cast until then
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loginHref = '/login' as any;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate, isPending } = useAuthNativeSignUp();

  const {
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { handleErrorForm } = useErrorHandlingForm<FormData>({ t, i18n, setError });

  function onSubmit(data: FormData) {
    const { firstName, lastName, email, password } = data;
    mutate(
      { data: { firstName, lastName, email, password } },
      {
        onSuccess: async (res) => {
          await saveTokens(res.accessToken, res.refreshToken);
          login();
          router.replace('/');
        },
        onError: (error: unknown) => handleErrorForm(error as Error),
      }
    );
  }

  return (
    <View className="flex flex-col gap-6">
      <Text variant="h1" className="text-3xl font-bold">
        {t('auth.signup.title')}
      </Text>

      <FieldGroup>
        <View className="flex-row gap-4">
          <Field className="flex-1">
            <FieldLabel>{t('auth.signup.firstNameLabel')}</FieldLabel>
            <Input
              placeholder={t('auth.signup.firstNamePlaceholder')}
              autoComplete="given-name"
              onChangeText={(v) => setValue('firstName', v)}
            />
            <FieldError errors={[errors.firstName]} />
          </Field>
          <Field className="flex-1">
            <FieldLabel>{t('auth.signup.lastNameLabel')}</FieldLabel>
            <Input
              placeholder={t('auth.signup.lastNamePlaceholder')}
              autoComplete="family-name"
              onChangeText={(v) => setValue('lastName', v)}
            />
            <FieldError errors={[errors.lastName]} />
          </Field>
        </View>

        <Field>
          <FieldLabel>{t('auth.signup.emailLabel')}</FieldLabel>
          <Input
            placeholder={t('auth.signup.emailPlaceholder')}
            autoComplete="email"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(v) => setValue('email', v)}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field>
          <FieldLabel>{t('auth.signup.passwordLabel')}</FieldLabel>
          <View className="relative">
            <Input
              placeholder={t('auth.signup.passwordPlaceholder')}
              autoComplete="new-password"
              secureTextEntry={!showPassword}
              onChangeText={(v) => setValue('password', v)}
            />
            <Pressable
              className="absolute inset-y-0 right-0 items-center justify-center px-3"
              onPress={() => setShowPassword((v) => !v)}
              accessibilityLabel={
                showPassword ? t('auth.signup.hidePassword') : t('auth.signup.showPassword')
              }>
              <Icon
                as={showPassword ? EyeOffIcon : EyeIcon}
                className="size-4 text-muted-foreground"
              />
            </Pressable>
          </View>
          <FieldError errors={[errors.password]} />
        </Field>

        <Field>
          <FieldLabel>{t('auth.signup.confirmPasswordLabel')}</FieldLabel>
          <View className="relative">
            <Input
              placeholder={t('auth.signup.passwordPlaceholder')}
              autoComplete="new-password"
              secureTextEntry={!showConfirmPassword}
              onChangeText={(v) => setValue('confirmPassword', v)}
            />
            <Pressable
              className="absolute inset-y-0 right-0 items-center justify-center px-3"
              onPress={() => setShowConfirmPassword((v) => !v)}
              accessibilityLabel={
                showConfirmPassword ? t('auth.signup.hidePassword') : t('auth.signup.showPassword')
              }>
              <Icon
                as={showConfirmPassword ? EyeOffIcon : EyeIcon}
                className="size-4 text-muted-foreground"
              />
            </Pressable>
          </View>
          <FieldError errors={[errors.confirmPassword]} />
        </Field>

        {errors.root && (
          <Alert icon={AlertCircleIcon} variant="destructive">
            <AlertTitle>{errors.root.message}</AlertTitle>
          </Alert>
        )}

        <Button onPress={handleSubmit(onSubmit)} disabled={isPending}>
          <Text>{t('auth.signup.submit')}</Text>
        </Button>
      </FieldGroup>

      <View className="flex-row items-center gap-2">
        <Text className="text-sm text-muted-foreground">{t('auth.signup.hasAccount')}</Text>
        <Link
          href={loginHref}
          className="rounded-md border px-4 py-2 text-sm font-semibold text-foreground">
          {t('auth.signup.logIn')}
        </Link>
      </View>
    </View>
  );
}
