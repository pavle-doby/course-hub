import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '[mode]',
};

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="[mode]"
        initialParams={{ mode: 'login' }}
      />
    </Stack>
  );
}
