"use client";

import { useParams } from "next/navigation";
import { CourseEditor } from "../../components/course-editor";

export default function EditCoursePage() {
  const { publicId } = useParams<{ publicId: string }>();
  return <CourseEditor mode="edit" publicId={publicId} />;
}
