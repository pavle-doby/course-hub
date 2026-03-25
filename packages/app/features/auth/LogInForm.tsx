import { Form, UIButton, UIInput, SizableText, XStack, YStack } from '@my/ui';
import { JSX, useState } from 'react';
import { useLink, useRouter } from 'solito/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToastMessage } from 'app/hooks/toast/useToastMessage';
import { useAuthLogin } from '@my/api-client';
import { useErrorHandling } from 'app/hooks/errors/useErrorHandling';
import { AuthLoginQuerySchema } from '@my/contract';

type LogInFormValues = z.infer<typeof AuthLoginQuerySchema>;

export function LogInForm(): JSX.Element {
  const router = useRouter();

  const { showMessage } = useToastMessage();

  const { mutate: loginMutate } = useAuthLogin();

  const {
    register,
    formState: { errors },
    setError,
    handleSubmit,
  } = useForm<LogInFormValues>({
    resolver: zodResolver(AuthLoginQuerySchema),
  });

  const { handleError } = useErrorHandling({ setError });

  // const nextLink = useLink({ href: '/onboarding/basic' });
  const forgotLink = useLink({ href: '/auth/forgot' });
  const signupLink = useLink({ href: '/auth/signup' });

  const [hidePassword, setHidePassword] = useState(true);

  function onSubmit(data: LogInFormValues) {
    loginMutate(
      { data },
      {
        onSuccess: (data) => {
          showMessage({
            title: `Welcome back, ${data.firstName} ${data.lastName}!`,
            message: 'Login successful',
            style: 'success',
          });

          router.push('/');
        },
        onError: (error) => {
          handleError(error as unknown as Error);
        },
      }
    );
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
        <UIInput
          label="Email"
          placeholder="your@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <UIInput
          label="Password"
          placeholder="•••••••••"
          type={`${hidePassword ? 'password' : 'text'}`}
          error={errors.password?.message}
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
          {...register('password')}
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
      </YStack>
    </Form>
  );
}
