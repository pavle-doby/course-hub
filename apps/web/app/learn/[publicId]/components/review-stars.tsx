"use client";

import { Star } from "lucide-react";
import { useT } from "@repo/i18n/client";
import { cn } from "@repo/ui-web/lib/utils";

const RATINGS = [1, 2, 3, 4, 5] as const;

type ReviewStarsProps = {
  rating?: number;
  /** Makes the stars a 1–5 picker; read-only when omitted. */
  onRatingChange?: (rating: number) => void;
  className?: string;
};

export function ReviewStars({ rating = 0, onRatingChange, className }: ReviewStarsProps) {
  const { t } = useT();

  if (!onRatingChange) {
    return (
      <span
        className={cn("flex gap-0.5", className)}
        aria-label={t("learn.reviews.starsLabel", { rating })}
      >
        {RATINGS.map((value) => (
          <Star
            key={value}
            className={cn(
              "size-4 text-amber-400",
              value <= rating ? "fill-amber-400" : "text-muted-foreground/40"
            )}
          />
        ))}
      </span>
    );
  }

  return (
    <div role="radiogroup" aria-label={t("learn.reviews.rating")} className={cn("flex", className)}>
      {RATINGS.map((value) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={value === rating}
          aria-label={t("learn.reviews.starsLabel", { rating: value })}
          className="rounded-md p-1 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          onClick={() => onRatingChange(value)}
        >
          <Star
            className={cn(
              "size-8",
              value <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
            )}
          />
        </button>
      ))}
    </div>
  );
}
