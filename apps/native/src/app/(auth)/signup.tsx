import { AuthScreen } from "@/modules/auth/components/auth-screen";
import { SignupForm } from "@/modules/auth/components/signup-form";

export default function SignupScreen() {
  return (
    <AuthScreen>
      <SignupForm />
    </AuthScreen>
  );
}
