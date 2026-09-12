"use client";

import { useState } from "react";
import { useGetCourseInvitations } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingQuery } from "@repo/shared";
import { toast } from "@repo/ui-web/components/sonner";
import { Input } from "@repo/ui-web/components/input";
import { useDebounce } from "@/hooks/use-debounce";
import { ChPagination } from "@/components/ch-pagination";
import { Search } from "lucide-react";
import { InviteCard } from "./invite-card";
import { InviteEmailSkeleton, InviteLinkSkeleton } from "./invite-card-skeleton";

const PAGE_LIMIT = 5;
const SKELETON_ROWS = 5;

type InvitesListProps = {
  publicId: string;
  onCopy: (token: string) => void;
  onRevoke: (invitationId: string) => void;
};

export function InvitesList({ publicId, onCopy, onRevoke }: InvitesListProps) {
  const { t } = useT();
  const { query, debouncedQuery, setQuery } = useDebounce("");
  const [page, setPage] = useState(0);

  const [prevDebouncedQuery, setPrevDebouncedQuery] = useState(debouncedQuery);
  if (debouncedQuery !== prevDebouncedQuery) {
    setPrevDebouncedQuery(debouncedQuery);
    setPage(0);
  }

  const { data, isPending, error } = useGetCourseInvitations(
    { publicId },
    { query: debouncedQuery || undefined, page, limit: PAGE_LIMIT }
  );
  useErrorHandlingQuery({
    t: t as (key: string) => string,
    error,
    showToastError: ({ title, description }) => toast.error(title, { description }),
  });

  const totalPages = data ? Math.ceil(data.pagination.total / data.pagination.limit) : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder={t("invite.dialog.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {isPending ? (
        Array.from({ length: SKELETON_ROWS }).map((_, i) =>
          i % 2 === 0 ? <InviteEmailSkeleton key={i} /> : <InviteLinkSkeleton key={i} />
        )
      ) : data?.data.length ? (
        data.data.map((invitation) => (
          <InviteCard
            key={invitation.id}
            invitation={invitation}
            onCopy={onCopy}
            onRevoke={onRevoke}
          />
        ))
      ) : (
        <p className="text-sm text-muted-foreground">
          {debouncedQuery ? t("invite.dialog.noSearchResults") : t("invite.dialog.empty")}
        </p>
      )}

      {totalPages > 1 && (
        <ChPagination
          className="pt-1"
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          previousLabel={t("invite.dialog.previousPage")}
          nextLabel={t("invite.dialog.nextPage")}
        />
      )}
    </div>
  );
}
