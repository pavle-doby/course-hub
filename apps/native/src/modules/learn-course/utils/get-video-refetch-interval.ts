import type { Video } from "@repo/contract";
import { VIDEO_PROCESSING_REFETCH_INTERVAL, VIDEO_REFETCH_INTERVAL } from "@/utils/consts";

export function getVideoRefetchInterval(status: Video["status"] | undefined): number | false {
  if (status === "uploading") {
    return VIDEO_REFETCH_INTERVAL;
  }
  if (status === "processing") {
    return VIDEO_PROCESSING_REFETCH_INTERVAL;
  }
  return false;
}
