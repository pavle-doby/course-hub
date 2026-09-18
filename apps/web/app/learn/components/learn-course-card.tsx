"use client";

import Link from "next/link";
import Image from "next/image";
import { type Course, useGetPublicDocumentsByParent, useGetVideoByParent } from "@repo/api-client";
import { Card, CardContent } from "@repo/ui-web/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui-web/components/avatar";
import { BookOpen } from "lucide-react";
import { cn } from "@repo/ui-web/lib/utils";

type LearnCourseCardProps = {
  course: Course;
};

const BANNER_GRADIENTS = [
  "from-orange-500 to-rose-600",
  "from-blue-600 to-indigo-700",
  "from-emerald-500 to-teal-700",
  "from-fuchsia-600 to-purple-700",
];

// Deterministic pick so a course always shows the same banner color.
function gradientFor(id: string) {
  let hash = 2166136261;
  for (const char of id) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  }
  hash ^= hash >>> 16;
  return BANNER_GRADIENTS[(hash >>> 0) % BANNER_GRADIENTS.length];
}

function creatorInitials(creator: Course["creator"]) {
  const initials = `${creator?.firstName?.charAt(0) ?? ""}${creator?.lastName?.charAt(0) ?? ""}`;
  return initials || (creator?.username.charAt(0).toUpperCase() ?? "?");
}

export function LearnCourseCard({ course }: LearnCourseCardProps) {
  const parent = { parentType: "course" as const, parentId: course.id };
  const { data: video } = useGetVideoByParent(parent);
  const { data: documents = [] } = useGetPublicDocumentsByParent(parent);
  const thumbnailUrl = video
    ? video.thumbnailUrl
    : documents.find((document) => document.contentType.startsWith("image/"))?.publicUrl;

  return (
    <Link href={`/learn/${course.publicId}`} className="flex h-full">
      <Card className="h-full w-full gap-0 py-0 transition-shadow hover:shadow-md">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
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
              gradientFor(course.id)
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
