import { Form, UIButton, UIInput, YStack } from '@my/ui';
import { JSX } from 'react';
import { useLink } from 'solito/navigation';

export function ForgotPasswordForm(): JSX.Element {
  // TODO@pavle: Implement forgot password functionality
  const nextLink = useLink({
    href: '/auth/login',
  });

  return (
    <Form
      display="flex"
      justifyContent="space-between"
      flexGrow={1}
      width="$full"
      gap={'$6'}
    >
      <YStack gap="$3.5">
        <UIInput
          label="Email"
          placeholder="your@email.com"
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
