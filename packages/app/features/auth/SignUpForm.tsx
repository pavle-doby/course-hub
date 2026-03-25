import { JSX, useState } from 'react';
import { Form, UIButton, UIInput, YStack } from '@my/ui';
import { useRouter } from 'solito/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
  const { handleError: handleErrors } = useErrorHandling();

  const { mutate: signUpMutate, error } = useAuthSignUp();

  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpFormSchema),
  });

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
          handleErrors(error as unknown as Error);
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
          label="First Name"
          placeholder="John"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <UIInput
          label="Last Name"
          placeholder="Doe"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
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
            props: {
              disabled: !watch('password')?.length,
            },
            onPress: () => setHidePassword(!hidePassword),
          }}
          {...register('password')}
        />
        <UIInput
          label="Repeat Password"
          placeholder="•••••••••"
          type={`${hideConfirmPassword ? 'password' : 'text'}`}
          error={errors.confirmPassword?.message}
          action={{
            content: hideConfirmPassword ? 'Show password' : 'Hide password',
            props: {
              disabled: !watch('confirmPassword')?.length,
            },
            onPress: () => setHideConfirmPassword(!hideConfirmPassword),
          }}
          {...register('confirmPassword')}
        />

        {/* // TODO@pavle: Add checkbox for T&C */}
      </YStack>

      <Form.Trigger asChild>
        <UIButton primary>Create Account</UIButton>
      </Form.Trigger>
    </Form>
  );
}
