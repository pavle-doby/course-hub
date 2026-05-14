import { AuthScreen } from 'app/features/auth/screen';
import { Stack } from 'expo-router';
import { useParams } from 'solito/navigation';
import { useAuth } from '../providers/AuthProvider';
import { KeyboardSafeView } from '../components/KeyboardSafeView';

const TITLES: Record<string, string> = {
  login: 'Welcome back!',
  signup: 'Create account',
  forgot: 'Reset password',
};

export default function Screen() {
  const { mode } = useParams();
  const { login } = useAuth();
  const showHeader = mode !== 'login';

  return (
    <KeyboardSafeView>
      <Stack.Screen
        options={{
          headerShown: showHeader,
          title: TITLES[mode as string] ?? '',
          headerBackTitle: 'Back',
        }}
      />
      <AuthScreen mode={mode as string} onLoginSuccess={login} />
    </KeyboardSafeView>
  );
}
