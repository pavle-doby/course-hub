import { Form, UIButton, UIInput, SizableText, XStack, YStack } from '@my/ui';
import { JSX, useState } from 'react';
import { useLink, useRouter } from 'solito/navigation';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToastMessage } from 'app/hooks/toast/useToastMessage';
import { useAuthLogin, useAuthNativeLogin } from '@my/api-client';
import { useErrorHandling } from 'app/hooks/errors/useErrorHandling';
import { AuthLoginQuerySchema } from '@my/contract';
import { Platform } from 'react-native';
import { saveTokens } from 'app/utils/tokenStorage';

type LogInFormValues = z.infer<typeof AuthLoginQuerySchema>;

interface LogInFormProps {
  onLoginSuccess?: () => void | Promise<void>;
}

export function LogInForm({ onLoginSuccess }: LogInFormProps): JSX.Element {
  const router = useRouter();

  const { showMessage } = useToastMessage();

  const isMobile = Platform.OS !== 'web';

  const { mutate: loginMutateWeb } = useAuthLogin();
  const { mutate: loginMutateNative } = useAuthNativeLogin();

  const {
    control,
    formState: { errors },
    setError,
    handleSubmit,
  } = useForm<LogInFormValues>({
    resolver: zodResolver(AuthLoginQuerySchema),
    defaultValues: {
      email: 'iampavle.test+1@gmail.com',
      password: 'testic13',
    },
  });

  const { handleError } = useErrorHandling({ setError });

  const forgotLink = useLink({ href: '/auth/forgot', replace: false });
  const signupLink = useLink({ href: '/auth/signup', replace: false });
  const homeLink = useLink({ href: '/', replace: false });

  const [hidePassword, setHidePassword] = useState(true);

  const handleOnSubmitNative = (data: LogInFormValues) => {
    loginMutateNative(
      { data },
      {
        onSuccess: async (data) => {
          const user = data.user;

          await saveTokens(data.accessToken, data.refreshToken);
          await onLoginSuccess?.();

          showMessage({
            title: `Welcome back, ${user.firstName} ${user.lastName}!`,
            message: 'Login successful',
            style: 'success',
          });

          router.replace('/');
        },
        onError: (error) => {
          handleError(error as unknown as Error);
        },
      }
    );
  };

  const handleOnSubmitWeb = (data: LogInFormValues) => {
    loginMutateWeb(
      { data },
      {
        onSuccess: (data) => {
          showMessage({
            title: `Welcome back, ${data.firstName} ${data.lastName}!`,
            message: 'Login successful',
            style: 'success',
          });

          router.replace('/');
        },
        onError: (error) => {
          handleError(error as unknown as Error);
        },
      }
    );
  };

  function onSubmit(data: LogInFormValues) {
    if (isMobile) {
      handleOnSubmitNative(data);
    } else {
      handleOnSubmitWeb(data);
    }
  }

  return (
    <Form
      display="flex"
      justifyContent="space-between"
      flexGrow={1}
      width="$full"
      gap={'$6'}
      onSubmit={handleSubmit(onSubmit)}
    >
      <YStack gap="$3.5">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <UIInput
              label="Email"
              placeholder="your@email.com"
              error={errors.email?.message}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              ref={ref}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <UIInput
              label="Password"
              placeholder="•••••••••"
              type={`${hidePassword ? 'password' : 'text'}`}
              error={errors.password?.message}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              ref={ref}
              action={{
                content: hidePassword ? 'Show password' : 'Hide password',
                onPress: () => setHidePassword(!hidePassword),
              }}
              message={
                <XStack
                  flexDirection="row"
                  alignItems="center"
                >
                  <SizableText>Forgot your password?</SizableText>
                  <UIButton
                    primary
                    clean
                    {...forgotLink}
                    marginLeft={'$1'}
                  >
                    Reset
                  </UIButton>
                </XStack>
              }
            />
          )}
        />
      </YStack>

      <YStack>
        <Form.Trigger asChild>
          <UIButton primary>Log In</UIButton>
        </Form.Trigger>

        <XStack
          alignItems="center"
          marginTop={'$1.5'}
        >
          <SizableText>Don't have an account?</SizableText>
          <UIButton
            primary
            clean
            {...signupLink}
            marginLeft={'$1'}
          >
            Sign Up
          </UIButton>
        </XStack>

        <XStack
          alignItems="center"
          marginTop={'$1.5'}
        >
          <SizableText>Test Auth</SizableText>
          <UIButton
            primary
            clean
            {...homeLink}
            marginLeft={'$1'}
          >
            Home
          </UIButton>
        </XStack>
      </YStack>
    </Form>
  );
}
