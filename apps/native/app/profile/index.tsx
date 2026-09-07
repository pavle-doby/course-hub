import { Stack } from 'expo-router';
import { useTranslation } from '@repo/i18n/native';
import { ProfileView } from '@/components/profile-view';

export default function ProfileScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('profile.title') }} />
      <ProfileView />
    </>
  );
}
