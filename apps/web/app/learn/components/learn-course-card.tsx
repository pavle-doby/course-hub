import Link from "next/link";
import type { Course } from "@repo/api-client";
import { Card, CardContent } from "@repo/ui-web/components/card";
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
  const hash = [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return BANNER_GRADIENTS[hash % BANNER_GRADIENTS.length];
}

export function LearnCourseCard({ course }: LearnCourseCardProps) {
  return (
    <Link href={`/learn/${course.publicId}`} className="flex h-full">
      <Card className="h-full w-full gap-0 py-0 transition-shadow hover:shadow-md">
        <div
          className={cn(
            "flex aspect-video items-center justify-center bg-gradient-to-br",
            gradientFor(course.id)
          )}
        >
          <BookOpen className="size-10 text-white/90" />
        </div>

        <CardContent className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {course.name.charAt(0).toUpperCase()}
            </span>
            <h3 className="line-clamp-1 font-semibold">{course.name}</h3>
          </div>
          {course.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
