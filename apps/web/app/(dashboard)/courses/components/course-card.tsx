"use client";

import { Course } from "@repo/api-client";
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
import { ChevronsLeftRight, EllipsisVertical, Pencil, Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type CourseCardProps = {
  course: Course;
  onDelete: (id: string) => void;
};

export function CourseCard({ course, onDelete }: CourseCardProps) {
  const router = useRouter();

  return (
    <Card className="min-h-25">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary">
          <ChevronsLeftRight className="size-4 shrink-0" />
          <CardTitle>{course.name}</CardTitle>
        </div>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <EllipsisVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/courses/${course.publicId}/edit`)}>
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/courses/${course.publicId}`)}>
                <Eye className="size-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(course.id)}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
    </Card>
  );
}
