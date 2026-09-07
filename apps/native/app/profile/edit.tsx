import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from '@repo/i18n/native';
import { ProfileEditForm } from '@/components/profile-edit-form';

export default function ProfileEditScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('profile.edit.title') }} />
      <KeyboardAvoidingView
        className="bg-background flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled">
          <ProfileEditForm />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
