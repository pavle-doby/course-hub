"use client";

import { useId } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui-web/components/card";
import { Field, FieldGroup, FieldLabel } from "@repo/ui-web/components/field";
import { Input } from "@repo/ui-web/components/input";
import { Button } from "@repo/ui-web/components/button";
import Link from "next/link";
import { cn } from "@repo/ui-web/lib/utils";

export function ForgotForm({ className, ...props }: React.ComponentProps<"div">) {
  const id = useId();
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>Enter your email and we&apos;ll send you a reset link</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={`${id}-email`}>Email</FieldLabel>
                <Input id={`${id}-email`} type="email" placeholder="you@example.com" required />
              </Field>
              <Field>
                <Button type="submit" className="w-full">
                  Send reset link
                </Button>
                <p className="text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link href="/auth/login" className="underline-offset-4 hover:underline">
                    Log in
                  </Link>
                </p>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
