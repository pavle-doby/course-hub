import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon } from 'lucide-react-native';
import { useGetUserSelf, useUpdateUser, useDeleteUser } from '@repo/api-client';
import { UserPutQuerySchema } from '@repo/contract';
import { useTranslation } from '@repo/i18n/native';
import { useErrorHandlingForm, useZodLocale } from '@repo/shared';
import { useAuth } from '@/app/providers/AuthProvider';
import { Alert, AlertTitle } from '@repo/ui-native/components/alert';
import { Button } from '@repo/ui-native/components/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@repo/ui-native/components/field';
import { Input } from '@repo/ui-native/components/input';
import { Text } from '@repo/ui-native/components/text';
import { ActivityIndicator, Alert as RNAlert, View } from 'react-native';
import { ProfileAvatar } from '@/components/profile-avatar';

// drizzle-zod's createUpdateSchema infers field types as `never` with the
// currently installed drizzle-zod/zod versions, so the form values are typed
// explicitly here and the resolver is cast (documented workaround).
type ProfileFormValues = {
  username: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
};

export function ProfileEditForm() {
  const router = useRouter();
  const { logout } = useAuth();
  const { t, i18n } = useTranslation();
  useZodLocale(i18n);

  const { data: user, isPending } = useGetUserSelf();
  const { mutate: updateUser, isPending: isSaving } = useUpdateUser();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const {
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(UserPutQuerySchema) as unknown as Resolver<ProfileFormValues>,
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
      });
    }
  }, [user, reset]);

  const { handleErrorForm } = useErrorHandlingForm<ProfileFormValues>({ t, i18n, setError });

  function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    updateUser(
      { pathParams: { id: user.id }, data },
      {
        onSuccess: () => router.back(),
        onError: (error: unknown) => handleErrorForm(error as Error),
      }
    );
  }

  function onDelete() {
    if (!user) return;
    RNAlert.alert(t('profile.edit.deleteConfirmTitle'), t('profile.edit.deleteConfirmMessage'), [
      { text: t('profile.edit.cancel'), style: 'cancel' },
      {
        text: t('profile.edit.delete'),
        style: 'destructive',
        onPress: () => deleteUser({ pathParams: { id: user.id } }, { onSuccess: () => logout() }),
      },
    ]);
  }

  if (isPending || !user) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 gap-6 p-4">
      <FieldGroup>
        <Field>
          <FieldLabel>{t('profile.edit.username')}</FieldLabel>
          <Input
            defaultValue={user.username}
            autoCapitalize="none"
            onChangeText={(v) => setValue('username', v)}
          />
          <FieldError errors={[errors.username]} />
        </Field>

        <View className="flex-row items-center gap-4">
          <ProfileAvatar avatarUrl={user.avatarUrl} />
          <Button
            variant="secondary"
            size="sm"
            onPress={() => RNAlert.alert(t('profile.edit.changePhoto'))}>
            <Text>{t('profile.edit.changePhoto')}</Text>
          </Button>
        </View>

        <Field>
          <FieldLabel>{t('profile.edit.firstName')}</FieldLabel>
          <Input
            defaultValue={user.firstName ?? ''}
            onChangeText={(v) => setValue('firstName', v)}
          />
          <FieldError errors={[errors.firstName]} />
        </Field>

        <Field>
          <FieldLabel>{t('profile.edit.lastName')}</FieldLabel>
          <Input defaultValue={user.lastName ?? ''} onChangeText={(v) => setValue('lastName', v)} />
          <FieldError errors={[errors.lastName]} />
        </Field>

        <Field>
          <FieldLabel>{t('profile.edit.description')}</FieldLabel>
          <Input
            defaultValue={user.bio ?? ''}
            multiline
            numberOfLines={4}
            className="h-24 py-2"
            textAlignVertical="top"
            onChangeText={(v) => setValue('bio', v)}
          />
          <FieldError errors={[errors.bio]} />
        </Field>

        {errors.root && (
          <Alert icon={AlertCircleIcon} variant="destructive">
            <AlertTitle>{errors.root.message}</AlertTitle>
          </Alert>
        )}
      </FieldGroup>

      <View className="flex-1" />

      <View className="flex-row gap-3">
        <Button variant="destructive" className="flex-1" disabled={isDeleting} onPress={onDelete}>
          <Text>{t('profile.edit.delete')}</Text>
        </Button>
        <Button variant="outline" className="flex-1" onPress={() => router.back()}>
          <Text>{t('profile.edit.cancel')}</Text>
        </Button>
        <Button className="flex-1" disabled={isSaving} onPress={handleSubmit(onSubmit)}>
          <Text>{t('profile.edit.save')}</Text>
        </Button>
      </View>
    </View>
  );
}
