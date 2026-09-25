"use client";

import { useRouter } from "next/navigation";
import { LessonListItem } from "@repo/api-client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  CardFooter,
} from "@repo/ui-web/components/card";
import { useIsMobile } from "@repo/ui-web/hooks/use-mobile";
import { FileIcon } from "lucide-react";
import { Badge } from "@repo/ui-web/components/badge";
import { LessonCardDropdownActions } from "./lesson-card-dropdown-actions";
import { LessonCardDrawerActions } from "./lesson-card-drawer-actions";

type LessonCardProps = {
  lesson: LessonListItem;
  onDelete: (id: string) => void;
};

export function LessonCard({ lesson, onDelete }: LessonCardProps) {
  const router = useRouter();
  const isMobile = useIsMobile();

  const actionMenuProps = {
    onEdit: () => router.push(`/courses/${lesson.coursePublicId}/edit?lesson=${lesson.id}`),
    onDelete: () => onDelete(lesson.id),
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-primary">
          <FileIcon className="size-4 shrink-0" />
          <CardTitle>{lesson.name}</CardTitle>
        </div>
        <CardAction>
          {isMobile ? (
            <LessonCardDrawerActions {...actionMenuProps} />
          ) : (
            <LessonCardDropdownActions {...actionMenuProps} />
          )}
        </CardAction>
      </CardHeader>

      <CardContent className="line-clamp-3 flex-1">{lesson.description}</CardContent>

      <CardFooter>
        <Badge variant="secondary">#{lesson.position}</Badge>
      </CardFooter>
    </Card>
  );
}
