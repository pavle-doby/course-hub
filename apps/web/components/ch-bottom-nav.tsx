import * as React from "react";
import { cn } from "@repo/ui-web/lib/utils";

/**
 * Shared mobile footer shell. It is fixed by default so global navigation stays
 * viewport-anchored; use `sticky` for route-local navigation or `static` inside another sticky footer.
 *
 * @example
 * <ChBottomNav className="sticky">
 *   <div className="flex flex-1 items-center justify-between">
 *     <Button>Previous</Button>
 *     <Button>Contents</Button>
 *     <Button>Next</Button>
 *   </div>
 * </ChBottomNav>
 */
export function ChBottomNav({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 h-20 justify-around border-t bg-background pt-3 md:hidden",
        className
      )}
      {...props}
    />
  );
}
