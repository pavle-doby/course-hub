import { UICard, UIContainer, UIPageInfo } from '@my/ui';
import { LogInForm } from './LogInForm';
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { JSX } from 'react';

interface AuthScreenProps {
  mode: string;
}

enum AuthMode {
  LOGIN = 'login',
  SIGNUP = 'signup',
  FORGOT = 'forgot',
}

const AUTH_MODE_INFO = {
  [AuthMode.LOGIN]: {
    title: 'Welcome back!',
    info: 'Log in to your Course Hub account to continue.',
  },
  [AuthMode.SIGNUP]: {
    title: 'Create your Course Hub account',
    info: 'Free. Simple. Sassy.',
  },
  [AuthMode.FORGOT]: {
    title: 'Forgot your password?',
    info: 'No worries! We got you covered.',
  },
};

export function AuthScreen({ mode }: AuthScreenProps): JSX.Element {
  return (
    <UIContainer>
      <UIPageInfo
        title={AUTH_MODE_INFO[mode]?.title || ''}
        info={AUTH_MODE_INFO[mode]?.info || ''}
      />

      <UICard>
        {mode === 'login' && <LogInForm />}
        {mode === 'signup' && <SignUpForm />}
        {mode === 'forgot' && <ForgotPasswordForm />}
      </UICard>
    </UIContainer>
  );
}
