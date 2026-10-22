"use client";

import { useId } from "react";
import { useT } from "@repo/i18n/client";
import { Input } from "@repo/ui-web/components/input";
import { COURSE_CURRENCY } from "@/utils/consts";

type CoursePriceInputProps = {
  /** In cents. */
  price: number;
  onPriceChange: (price: number) => void;
};

/** Price in whole currency units, saved on blur as cents. Invalid input snaps back to the saved price. */
export function CoursePriceInput({ price, onPriceChange }: CoursePriceInputProps) {
  const id = useId();
  const { t } = useT();

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    const value = Number(event.target.value);
    const cents = Math.round(value * 100);
    if (event.target.value === "" || !Number.isFinite(value) || cents < 0) {
      event.target.value = String(price / 100);
      return;
    }
    if (cents !== price) {
      onPriceChange(cents);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm">
        {t("courses.editor.priceLabel", { currency: COURSE_CURRENCY })}
      </label>
      {/* keyed on price so a saved (or rejected) value resets the uncontrolled input */}
      <Input
        key={price}
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        step={0.01}
        defaultValue={price / 100}
        onBlur={handleBlur}
      />
      <span className="text-xs text-muted-foreground">{t("courses.editor.priceHint")}</span>
    </div>
  );
}
