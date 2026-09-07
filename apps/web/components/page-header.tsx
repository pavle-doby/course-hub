import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@repo/ui-web/components/input";
import { cn } from "@repo/ui-web/lib/utils";

type PageHeaderProps = {
  title: string;
  titleClassName?: string;
  search?: {
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
  action?: ReactNode;
  className?: string;
};

export function PageHeader({ title, titleClassName, search, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center gap-4 border-b px-4 py-3 md:px-6", className)}>
      <h1 className={cn("text-xl font-semibold", titleClassName)}>{title}</h1>
      {search && (
        <div className="relative flex-1">
          <div className="relative mx-auto w-full md:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={search.placeholder}
              className="pl-8"
              value={search.value}
              onChange={search.onChange}
            />
          </div>
        </div>
      )}
      {action}
    </div>
  );
}
