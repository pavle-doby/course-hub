"use client";

import { Lesson } from "@repo/api-client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  CardFooter,
} from "@repo/ui-web/components/card";
import { useIsMobile } from "@repo/ui-web/hooks/use-mobile";
import { File } from "lucide-react";
import { Badge } from "@repo/ui-web/components/badge";
import { LessonCardDropdownActions } from "./lesson-card-dropdown-actions";
import { LessonCardDrawerActions } from "./lesson-card-drawer-actions";

type LessonCardProps = {
  lesson: Lesson;
  onDelete: (id: string) => void;
};

export function LessonCard({ lesson, onDelete }: LessonCardProps) {
  const isMobile = useIsMobile();

  const actionMenuProps = {
    onDelete: () => onDelete(lesson.id),
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-primary">
          <File className="size-4 shrink-0" />
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

      <CardContent className="flex-1">{lesson.description}</CardContent>

      <CardFooter>
        <Badge variant="secondary">#{lesson.position}</Badge>
      </CardFooter>
    </Card>
  );
}
