"use client";

import { useRouter } from "next/navigation";
import { Share2Icon } from "lucide-react";
import {
  useGetUserSelf,
  useGetCourses,
  useGetEnrollmentsStats,
  useGetEnrolledCourses,
} from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { Button } from "@repo/ui-web/components/button";
import { Card, CardContent } from "@repo/ui-web/components/card";
import { Skeleton } from "@repo/ui-web/components/skeleton";
import { ProfileAvatar } from "@/app/profile/components/profile-avatar";
import { PageHeader } from "@/components/page-header";

function ProfileStat({ value, label }: { value: number | undefined; label: string }) {
  return (
    <div className="flex items-center gap-1">
      {value === undefined ? (
        <Skeleton className="h-5 w-5" />
      ) : (
        <span className="font-bold">{value}</span>
      )}
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useT();
  const { data: user, isPending } = useGetUserSelf();
  const { data: courses } = useGetCourses({ limit: 1 });
  const { data: enrolledCourses } = useGetEnrolledCourses({ limit: 1 });
  const { data: stats } = useGetEnrollmentsStats();

  if (isPending || !user) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader className="mb-6 hidden md:flex" title={t("profile.title")} />
        <div className="flex justify-center px-4 pt-4 md:px-6 md:pt-0">
          <Card className="w-full max-w-2xl">
            <CardContent className="flex gap-6">
              <Skeleton className="size-22 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>

                <div className="flex flex-row gap-4">
                  <ProfileStat value={undefined} label={t("profile.courses")} />
                  <ProfileStat value={undefined} label={t("profile.students")} />
                  <ProfileStat value={undefined} label={t("profile.enrollments")} />
                  <ProfileStat value={undefined} label={t("profile.enrolled")} />
                </div>

                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-full max-w-sm" />
                  <Skeleton className="h-4 w-2/3 max-w-sm" />
                </div>

                <div className="flex flex-row gap-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username;

  async function onShare() {
    const shareData = { title: fullName, text: `${fullName} — @${user!.username}` };
    if (navigator.share) {
      await navigator.share(shareData).catch(() => {});
    } else {
      await navigator.clipboard.writeText(shareData.text);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader className="mb-6 hidden md:flex" title={t("profile.title")} />
      <div className="flex flex-col gap-6 px-4 pt-4 pb-4 md:px-6 md:pt-0 md:pb-6">
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl">
            <CardContent className="flex gap-6">
              <ProfileAvatar avatarUrl={user.avatarUrl} username={user.username} />

              <div className="flex flex-1 flex-col gap-4">
                <div>
                  <h2 className="text-xl font-bold">@{user.username}</h2>
                  <p className="text-sm text-muted-foreground">{fullName}</p>
                </div>

                <div className="flex flex-row gap-4 text-sm">
                  <ProfileStat value={courses?.pagination.total} label={t("profile.courses")} />
                  <ProfileStat value={stats?.studentsCount} label={t("profile.students")} />
                  <ProfileStat value={stats?.enrollmentsCount} label={t("profile.enrollments")} />
                  <ProfileStat
                    value={enrolledCourses?.pagination.total}
                    label={t("profile.enrolled")}
                  />
                </div>

                {user.bio && <p className="text-sm text-foreground">{user.bio}</p>}

                <div className="flex flex-row gap-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push("/profile/edit")}
                  >
                    {t("profile.editProfile")}
                  </Button>

                  <Button className="flex-1 gap-2" onClick={onShare}>
                    <Share2Icon className="size-4" />
                    {t("profile.shareProfile")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
