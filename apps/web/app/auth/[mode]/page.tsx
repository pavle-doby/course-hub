import { notFound } from "next/navigation";

import { LoginForm } from "./components/login-form";
import { SignupForm } from "./components/signup-form";
import { ForgotForm } from "./components/forgot-form";

const MODES = ["login", "signup", "forgot"] as const;

type Mode = (typeof MODES)[number];

export function generateStaticParams() {
  return MODES.map((mode) => ({ mode }));
}

export default async function AuthPage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode } = await params;

  if (!MODES.includes(mode as Mode)) {
    notFound();
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {mode === "login" && <LoginForm />}
        {mode === "signup" && <SignupForm />}
        {mode === "forgot" && <ForgotForm />}
      </div>
    </div>
  );
}
