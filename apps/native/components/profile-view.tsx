import { useRouter } from 'expo-router';
import { Share2Icon } from 'lucide-react-native';
import { useTranslation } from '@repo/i18n/native';
import { useGetUserSelf } from '@repo/api-client';
import { Button } from '@repo/ui-native/components/button';
import { Icon } from '@repo/ui-native/components/icon';
import { Text } from '@repo/ui-native/components/text';
import { ActivityIndicator, Share, View } from 'react-native';
import { ProfileAvatar } from '@/components/profile-avatar';

export function ProfileView() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: user, isPending } = useGetUserSelf();

  if (isPending || !user) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username;

  function onShare() {
    Share.share({ message: `${fullName} — @${user!.username}` });
  }

  return (
    <View className="flex-1 gap-6 p-4">
      <Text variant="h3" className="text-left text-3xl font-bold">
        {fullName}
      </Text>

      <View className="flex-row gap-4">
        <ProfileAvatar avatarUrl={user.avatarUrl} />
        {user.bio ? <Text className="text-foreground flex-1 text-sm">{user.bio}</Text> : null}
      </View>

      <Button variant="outline" onPress={() => router.push('/profile/edit')}>
        <Text>{t('profile.editProfile')}</Text>
      </Button>

      <Text variant="h3" className="text-xl font-bold">
        {t('profile.statistics')}
      </Text>

      <View className="flex-1" />

      <Button onPress={onShare}>
        <Icon as={Share2Icon} className="text-primary-foreground" />
        <Text>{t('profile.shareProfile')}</Text>
      </Button>
    </View>
  );
}
