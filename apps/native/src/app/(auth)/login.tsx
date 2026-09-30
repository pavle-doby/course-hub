import { AuthScreen } from "@/modules/auth/components/auth-screen";
import { LoginForm } from "@/modules/auth/components/login-form";

export default function LoginScreen() {
  return (
    <AuthScreen>
      <LoginForm />
    </AuthScreen>
  );
}
