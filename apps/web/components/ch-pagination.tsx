import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui-web/components/pagination";

interface ChPaginationProps {
  /** 0-indexed current page */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
}

// Builds a 1-indexed page list showing first, current-1, current, current+1, and
// last, with ellipsis filling any gaps between them.
function getPaginationRange(current: number, total: number): Array<number | "ellipsis"> {
  const pages = [...new Set([1, current - 1, current, current + 1, total])]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const range: Array<number | "ellipsis"> = [];
  pages.forEach((page, i) => {
    if (i > 0 && page - pages[i - 1]! > 1) range.push("ellipsis");
    range.push(page);
  });

  return range;
}

export function ChPagination({
  page,
  totalPages,
  onPageChange,
  previousLabel = "Previous",
  nextLabel = "Next",
  className,
}: ChPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-label={previousLabel}
            aria-disabled={page === 0}
            className={page === 0 ? "pointer-events-none opacity-50" : undefined}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(Math.max(0, page - 1));
            }}
          />
        </PaginationItem>
        {getPaginationRange(page + 1, totalPages).map((entry, i) =>
          entry === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={entry}>
              <PaginationLink
                href="#"
                isActive={entry === page + 1}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(entry - 1);
                }}
              >
                {entry}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-label={nextLabel}
            aria-disabled={page >= totalPages - 1}
            className={page >= totalPages - 1 ? "pointer-events-none opacity-50" : undefined}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(Math.min(totalPages - 1, page + 1));
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
