"use client";

import Link from "next/link";
import Image from "next/image";
import { type Course } from "@repo/api-client";
import { Card, CardContent } from "@repo/ui-web/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui-web/components/avatar";
import { BookOpen } from "lucide-react";
import { cn } from "@repo/ui-web/lib/utils";
import { courseCardGradient } from "@/utils/course-card-gradient";

type LearnCourseCardProps = {
  course: Course;
};

function creatorInitials(creator: Course["creator"]) {
  const initials = `${creator?.firstName?.charAt(0) ?? ""}${creator?.lastName?.charAt(0) ?? ""}`;
  return initials || (creator?.username.charAt(0).toUpperCase() ?? "?");
}

export function LearnCourseCard({ course }: LearnCourseCardProps) {
  return (
    <Link href={`/learn/${course.publicId}`} className="flex h-full">
      <Card className="h-full w-full gap-0 py-0 transition-shadow hover:shadow-md">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt=""
            width={640}
            height={178}
            unoptimized
            className="h-[178px] w-full object-cover"
          />
        ) : (
          <div
            className={cn(
              "flex h-[178px] w-full items-center justify-center bg-gradient-to-br",
              courseCardGradient(course.id)
            )}
          >
            <BookOpen className="size-10 text-white/90" />
          </div>
        )}

        <CardContent className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-center gap-2">
            <Avatar>
              {course.creator?.avatarUrl && (
                <AvatarImage src={course.creator.avatarUrl} alt={course.creator.username} />
              )}
              <AvatarFallback>{creatorInitials(course.creator)}</AvatarFallback>
            </Avatar>
            <h3 className="line-clamp-1 font-semibold">{course.name}</h3>
          </div>
          {course.description && (
            <p className="line-clamp-3 text-sm text-muted-foreground">{course.description}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
