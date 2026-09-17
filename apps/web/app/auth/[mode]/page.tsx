import { Suspense } from "react";
import { notFound } from "next/navigation";

import { Card, CardContent } from "@repo/ui-web/components/card";
import { Skeleton } from "@repo/ui-web/components/skeleton";

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
        <Suspense
          fallback={
            <Card>
              <CardContent className="flex flex-col gap-6 pt-6">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          }
        >
          {mode === "login" && <LoginForm />}
          {mode === "signup" && <SignupForm />}
          {mode === "forgot" && <ForgotForm />}
        </Suspense>
      </div>
    </div>
  );
}
