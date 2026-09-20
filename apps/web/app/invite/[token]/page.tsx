"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useGetInvitationInfo, useAcceptInvitation, useGetUserSelf } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { Button } from "@repo/ui-web/components/button";
import { Card, CardContent, CardHeader, CardDescription } from "@repo/ui-web/components/card";
import { Skeleton } from "@repo/ui-web/components/skeleton";
import { toast } from "@repo/ui-web/components/sonner";
import { getAccessToken } from "@/utils/token-storage";

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { t } = useT();

  const hasAccessToken = Boolean(getAccessToken());
  const { data: user, isFetching: isUserPending } = useGetUserSelf({
    query: { enabled: hasAccessToken, retry: false },
  });
  const {
    data: invitation,
    isPending: isInvitationPending,
    isError,
  } = useGetInvitationInfo({ token });
  const { mutate: acceptInvitation, isPending: isAccepting } = useAcceptInvitation();

  function handleAccept() {
    acceptInvitation(
      { pathParams: { token } },
      {
        onSuccess: (result) => {
          toast.success(t("invite.accept.acceptedToast"));
          router.push(`/learn/${result.course.publicId}`);
        },
        onError: () => {
          toast.error(t("invite.accept.invalidTitle"));
        },
      }
    );
  }

  if (isInvitationPending || isUserPending) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <Skeleton className="h-40 w-full max-w-sm" />
      </div>
    );
  }

  if (isError || !invitation) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader className="flex flex-col items-center gap-2 pt-6 text-center">
            <h1 className="text-xl font-bold">{t("invite.accept.invalidTitle")}</h1>
            <CardDescription>{t("invite.accept.invalidDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="mb-6 w-full" asChild>
              <Link href="/">{t("invite.accept.goHome")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const signupHref =
    invitation.type === "email" && invitation.email
      ? `/auth/signup?token=${token}&email=${encodeURIComponent(invitation.email)}`
      : `/auth/signup?token=${token}`;

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col gap-4 pt-6">
          <h1 className="text-xl font-bold">{t("invite.accept.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("invite.accept.description", { name: invitation.course.name })}
          </p>

          {user ? (
            <Button onClick={handleAccept} disabled={isAccepting}>
              {t("invite.accept.acceptButton")}
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">{t("invite.accept.signupPrompt")}</p>
              <Button asChild>
                <a href={signupHref}>{t("invite.accept.signUp")}</a>
              </Button>
              <Button variant="outline" asChild>
                <a href={`/auth/login?token=${token}`}>{t("invite.accept.logIn")}</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
