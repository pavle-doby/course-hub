import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { useAuthNativeLogin } from '@repo/api-client';
import { AuthLoginQuerySchema, type AuthLogInUserReq } from '@repo/contract';
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

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { t, i18n } = useTranslation();
  useZodLocale(i18n);

  // Route types are generated on first `expo start`; cast until then
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const forgotHref = '/forgot' as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signupHref = '/signup' as any;

  const [showPassword, setShowPassword] = useState(false);

  const { mutate: loginMutateNative, isPending } = useAuthNativeLogin();

  const {
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<AuthLogInUserReq>({
    resolver: zodResolver(AuthLoginQuerySchema),
  });

  const { handleErrorForm } = useErrorHandlingForm<AuthLogInUserReq>({ t, i18n, setError });

  function onSubmit(data: AuthLogInUserReq) {
    loginMutateNative(
      { data },
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
        {t('auth.login.title')}
      </Text>

      <FieldGroup>
        <Field>
          <FieldLabel>{t('auth.login.emailLabel')}</FieldLabel>
          <Input
            placeholder={t('auth.login.emailPlaceholder')}
            autoComplete="email"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(v) => setValue('email', v)}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field>
          <FieldLabel>{t('auth.login.passwordLabel')}</FieldLabel>
          <View className="relative">
            <Input
              placeholder={t('auth.login.passwordPlaceholder')}
              autoComplete="current-password"
              secureTextEntry={!showPassword}
              onChangeText={(v) => setValue('password', v)}
            />
            <Pressable
              className="absolute inset-y-0 right-0 items-center justify-center px-3"
              onPress={() => setShowPassword((v) => !v)}
              accessibilityLabel={
                showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')
              }>
              <Icon
                as={showPassword ? EyeOffIcon : EyeIcon}
                className="size-4 text-muted-foreground"
              />
            </Pressable>
          </View>
          <FieldError errors={[errors.password]} />
          <Link href={forgotHref} className="text-sm text-foreground">
            {t('auth.login.forgotPassword')}{' '}
            <Text className="text-sm font-bold">{t('auth.login.resetPassword')}</Text>
          </Link>
        </Field>

        {errors.root && (
          <Alert icon={AlertCircleIcon} variant="destructive">
            <AlertTitle>{errors.root.message}</AlertTitle>
          </Alert>
        )}

        <Button onPress={handleSubmit(onSubmit)} disabled={isPending}>
          <Text>{t('auth.login.submit')}</Text>
        </Button>
      </FieldGroup>

      <View className="flex-row items-center gap-2">
        <Text className="text-sm text-muted-foreground">{t('auth.login.noAccount')}</Text>
        <Link
          href={signupHref}
          className="rounded-md border px-4 py-2 text-sm font-semibold text-foreground">
          {t('auth.login.signUp')}
        </Link>
      </View>
    </View>
  );
}
