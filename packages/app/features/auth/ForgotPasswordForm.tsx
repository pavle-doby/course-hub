import { Form, UIButton, UIInput, YStack } from '@my/ui';
import { JSX } from 'react';
import { useLink } from 'solito/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const ForgotPasswordFormSchema = z.object({
  email: z.email(),
});

type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordFormSchema>;

export function ForgotPasswordForm(): JSX.Element {
  // TODO@pavle: Implement forgot password functionality
  const nextLink = useLink({
    href: '/auth/login',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordFormSchema),
  });

  function onSubmit(_data: ForgotPasswordFormValues) {
    // TODO@pavle: Implement forgot password functionality
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
      </YStack>

      <UIButton
        primary
        {...nextLink}
      >
        Send Reset Link
      </UIButton>
    </Form>
  );
}
