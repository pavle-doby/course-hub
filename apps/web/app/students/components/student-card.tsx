import type { Student } from "@repo/api-client";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui-web/components/avatar";
import { Card } from "@repo/ui-web/components/card";
import { Skeleton } from "@repo/ui-web/components/skeleton";
import { useT } from "@repo/i18n/client";

function studentInitials(student: Student) {
  const initials = `${student.firstName?.charAt(0) ?? ""}${student.lastName?.charAt(0) ?? ""}`;
  return initials || student.username.charAt(0).toUpperCase();
}

function studentName(student: Student) {
  const fullName = `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim();
  return fullName || student.username;
}

export function StudentCard({ student }: { student: Student }) {
  const { t } = useT();

  return (
    <Card className="px-4">
      <div className="flex items-center gap-2">
        <Avatar>
          {student.avatarUrl && <AvatarImage src={student.avatarUrl} alt={student.username} />}
          <AvatarFallback>{studentInitials(student)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{studentName(student)}</span>
          <span className="text-xs text-muted-foreground">{student.email}</span>
        </div>
      </div>
      <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-xs">
        <dt className="text-muted-foreground">{t("students.table.course")}</dt>
        <dd>{student.course.name}</dd>
        <dt className="text-muted-foreground">{t("students.table.startDate")}</dt>
        <dd>{new Date(student.enrolledAt).toLocaleDateString()}</dd>
        {student.completedAt && (
          <>
            <dt className="text-muted-foreground">{t("students.table.completedDate")}</dt>
            <dd>{new Date(student.completedAt).toLocaleDateString()}</dd>
          </>
        )}
        {student.withdrawnAt && (
          <>
            <dt className="text-muted-foreground">{t("students.table.withdrawnDate")}</dt>
            <dd>{new Date(student.withdrawnAt).toLocaleDateString()}</dd>
          </>
        )}
      </dl>
    </Card>
  );
}

export function StudentCardSkeleton() {
  return (
    <Card className="px-4">
      <div className="flex items-center gap-2">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-32" />
      </div>
    </Card>
  );
}
