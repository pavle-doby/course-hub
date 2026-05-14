import { HomeScreen } from 'app/features/home/screen';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from './providers/AuthProvider';

export default function Screen() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Home',
        }}
      />
      <HomeScreen
        onLinkPress={() => router.push('/user/nate')}
        onLogout={logout}
      />
    </>
  );
}
