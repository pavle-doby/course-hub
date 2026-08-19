import { LoginForm } from '@/components/login-form';
import { Stack } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

export default function LoginScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Log in', headerShown: false }} />
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow justify-center p-6"
          keyboardShouldPersistTaps="handled">
          <LoginForm />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
