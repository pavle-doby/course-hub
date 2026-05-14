import { Stack } from 'expo-router';
import { useAuth } from './AuthProvider';

export const StackProvider = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Stack>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="user/[id]"
          options={{ headerShown: false }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen
          name="auth"
          options={{ headerShown: false }}
        />
      </Stack.Protected>
    </Stack>
  );
};
