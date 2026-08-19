import { Button } from '@repo/ui-native/components/button';
import { Field, FieldGroup, FieldLabel } from '@repo/ui-native/components/field';
import { Input } from '@repo/ui-native/components/input';
import { Text } from '@repo/ui-native/components/text';
import { Link } from 'expo-router';
import { View } from 'react-native';

export function ForgotForm() {
  // Route types are generated on first `expo start`; cast until then
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loginHref = '/login' as any;
  return (
    <View className="flex flex-col gap-6">
      <View className="flex flex-col gap-1">
        <Text variant="h1" className="text-3xl font-bold">
          Reset your password
        </Text>
        <Text className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </Text>
      </View>

      <FieldGroup>
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </Field>

        <Button>
          <Text>Send reset link</Text>
        </Button>
      </FieldGroup>

      <View className="flex-row items-center gap-1">
        <Text className="text-sm text-muted-foreground">Remember your password?</Text>
        <Link href={loginHref} className="text-sm font-semibold text-foreground underline">
          Log in
        </Link>
      </View>
    </View>
  );
}
