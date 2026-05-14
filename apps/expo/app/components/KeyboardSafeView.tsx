import { JSX, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export function KeyboardSafeView({ children }: { children: ReactNode }): JSX.Element {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {children}
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
}
