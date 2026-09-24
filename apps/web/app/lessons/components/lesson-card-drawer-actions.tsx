"use client";

import { useState } from "react";
import { useT } from "@repo/i18n/client";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/ui-web/components/drawer";
import { Button } from "@repo/ui-web/components/button";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";

type LessonCardDrawerActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export function LessonCardDrawerActions({ onEdit, onDelete }: LessonCardDrawerActionsProps) {
  const { t } = useT();
  const [actionsOpen, setActionsOpen] = useState(false);

  return (
    <Drawer open={actionsOpen} onOpenChange={setActionsOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7">
          <EllipsisVertical className="size-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="border-b text-left">
          <DrawerTitle>{t("lessons.card.actions")}</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-3 p-2 pb-16">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={onEdit}>
              <Pencil className="size-4" />
              {t("lessons.card.edit")}
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button variant="destructive" className="w-full justify-start gap-2" onClick={onDelete}>
              <Trash2 className="size-4" />
              {t("lessons.card.delete")}
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
