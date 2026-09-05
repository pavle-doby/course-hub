"use client";

import { useGetStudents } from "@repo/api-client";
import type { Student } from "@repo/api-client";
import { Input } from "@repo/ui-web/components/input";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui-web/components/avatar";
import { Skeleton } from "@repo/ui-web/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui-web/components/table";
import { Search } from "lucide-react";
import { useT } from "@repo/i18n/client";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { ChPagination, ChPaginationSkeleton } from "@/components/ch-pagination";

const PAGE_LIMIT = 10;
const SKELETON_ROWS = 5;

function studentInitials(student: Student) {
  const initials = `${student.firstName?.charAt(0) ?? ""}${student.lastName?.charAt(0) ?? ""}`;
  return initials || student.username.charAt(0).toUpperCase();
}

function studentName(student: Student) {
  const fullName = `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim();
  return fullName || student.username;
}

export default function StudentsPage() {
  const { t } = useT();
  const { query, debouncedQuery, setQuery } = useDebounce("");
  const { page, setPage, trackTotalPages } = usePagination(debouncedQuery);

  const { data: students, isPending } = useGetStudents({
    query: debouncedQuery || undefined,
    page,
    limit: PAGE_LIMIT,
  });

  const { totalPages, knownTotalPages } = trackTotalPages(students?.pagination);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 p-4 lg:p-6">
        <h1 className="hidden text-xl font-semibold lg:block">{t("students.title")}</h1>
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("students.searchPlaceholder")}
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 pt-0 lg:px-6 lg:pb-6">
        {isPending ? (
          <div className="flex flex-1 flex-col justify-between">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("students.table.student")}</TableHead>
                    <TableHead>{t("students.table.course")}</TableHead>
                    <TableHead>{t("students.table.startDate")}</TableHead>
                    <TableHead>{t("students.table.completedDate")}</TableHead>
                    <TableHead>{t("students.table.withdrawnDate")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="size-10 shrink-0 rounded-full" />
                          <div className="flex flex-col gap-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ChPaginationSkeleton className="mt-6" page={page} totalPages={knownTotalPages} />
          </div>
        ) : students?.data.length ? (
          <div className="flex flex-1 flex-col justify-between">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("students.table.student")}</TableHead>
                    <TableHead>{t("students.table.course")}</TableHead>
                    <TableHead>{t("students.table.startDate")}</TableHead>
                    <TableHead>{t("students.table.completedDate")}</TableHead>
                    <TableHead>{t("students.table.withdrawnDate")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.data.map((student) => (
                    <TableRow key={`${student.id}-${student.course.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar>
                            {student.avatarUrl && (
                              <AvatarImage src={student.avatarUrl} alt={student.username} />
                            )}
                            <AvatarFallback>{studentInitials(student)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{studentName(student)}</span>
                            <span className="text-xs text-muted-foreground">{student.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{student.course.name}</TableCell>
                      <TableCell>{new Date(student.enrolledAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {student.completedAt
                          ? new Date(student.completedAt).toLocaleDateString()
                          : ""}
                      </TableCell>
                      <TableCell>
                        {student.withdrawnAt
                          ? new Date(student.withdrawnAt).toLocaleDateString()
                          : ""}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <ChPagination
              className="mt-6"
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              previousLabel={t("students.pagination.previous")}
              nextLabel={t("students.pagination.next")}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("students.empty")}</p>
        )}
      </div>
    </div>
  );
}
