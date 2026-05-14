import { JSX, useState } from 'react';
import { Form, UIButton, UIInput, SizableText, XStack, YStack } from '@my/ui';
import { useLink, useRouter } from 'solito/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { useErrorHandling } from 'app/hooks/errors/useErrorHandling';
import { useToastMessage } from 'app/hooks/toast/useToastMessage';
import { useAuthSignUp } from '@my/api-client';
import { AuthSignUpQuerySchema } from '@my/contract';
import type { AuthSignUpUserReq } from '@my/contract';

const SignUpFormSchema = AuthSignUpQuerySchema.extend({
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignUpFormValues = z.infer<typeof SignUpFormSchema>;

export function SignUpForm(): JSX.Element {
  const router = useRouter();

  const { showMessage } = useToastMessage();

  const loginLink = useLink({ href: '/auth/login' });

  const { mutate: signUpMutate } = useAuthSignUp();

  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpFormSchema),
  });

  const { handleError } = useErrorHandling({ setError });

  function onSubmit({ confirmPassword: _, ...data }: SignUpFormValues) {
    signUpMutate(
      {
        data: data as AuthSignUpUserReq,
      },
      {
        onSuccess: () => {
          showMessage({
            title: 'Signup successful',
            message: 'You have successfully signed up',
            style: 'success',
          });

          router.push('/auth/login');
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
        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <UIInput
              label="First Name"
              placeholder="John"
              autoCapitalize="words"
              error={errors.firstName?.message}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              ref={ref}
            />
          )}
        />
        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <UIInput
              label="Last Name"
              placeholder="Doe"
              autoCapitalize="words"
              error={errors.lastName?.message}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              ref={ref}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <UIInput
              label="Email"
              placeholder="your@email.com"
              type="email"
              keyboardType="email-address"
              autoCapitalize="none"
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
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.password?.message}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              ref={ref}
              action={{
                content: hidePassword ? 'Show password' : 'Hide password',
                props: {
                  disabled: !watch('password')?.length,
                },
                onPress: () => setHidePassword(!hidePassword),
              }}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <UIInput
              label="Repeat Password"
              placeholder="•••••••••"
              type={`${hideConfirmPassword ? 'password' : 'text'}`}
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.confirmPassword?.message}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              ref={ref}
              action={{
                content: hideConfirmPassword ? 'Show password' : 'Hide password',
                props: {
                  disabled: !watch('confirmPassword')?.length,
                },
                onPress: () => setHideConfirmPassword(!hideConfirmPassword),
              }}
            />
          )}
        />

        {/* // TODO@pavle: Add checkbox for T&C */}
      </YStack>

      <YStack>
        <Form.Trigger asChild>
          <UIButton primary>Create Account</UIButton>
        </Form.Trigger>

        <XStack
          alignItems="center"
          marginTop={'$1.5'}
        >
          <SizableText>Already have an account?</SizableText>
          <UIButton
            primary
            clean
            {...loginLink}
            marginLeft={'$1'}
          >
            Log In
          </UIButton>
        </XStack>
      </YStack>
    </Form>
  );
}
