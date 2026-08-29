"use client";

import { Lesson } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@repo/ui-web/components/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@repo/ui-web/components/dropdown-menu";
import { Button } from "@repo/ui-web/components/button";
import { File, EllipsisVertical, Trash2 } from "lucide-react";
import { Badge } from "@repo/ui-web/components/badge";

type LessonCardProps = {
  lesson: Lesson;
  onDelete: (id: string) => void;
};

export function LessonCard({ lesson, onDelete }: LessonCardProps) {
  const { t } = useT();

  return (
    <Card className="min-h-25">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary">
          <File className="size-4 shrink-0" />
          <CardTitle>{lesson.name}</CardTitle>
        </div>
        <CardDescription className="line-clamp-2">{lesson.description}</CardDescription>
        <div className="mt-1">
          <Badge variant="secondary">#{lesson.position}</Badge>
        </div>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <EllipsisVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(lesson.id)}
              >
                <Trash2 className="size-4" />
                {t("lessons.card.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
    </Card>
  );
}
