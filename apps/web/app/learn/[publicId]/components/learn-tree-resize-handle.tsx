"use client";

import { useLayoutEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
import { useT } from "@repo/i18n/client";

const MIN_WIDTH = 192;
const MAX_WIDTH = 480;
const KEYBOARD_STEP = 16;
const STORAGE_KEY = "learn-tree-width";

function clampWidth(width: number) {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width));
}

// ponytail: writes --sidebar-width straight onto the sidebar wrapper so dragging doesn't re-render the page.
function getWrapper(element: HTMLElement) {
  return element.closest<HTMLElement>("[data-slot=sidebar-wrapper]");
}

function applyWidth(wrapper: HTMLElement, width: number) {
  wrapper.style.setProperty("--sidebar-width", `${width}px`);
}

function saveWidth(width: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(width));
  } catch {
    // storage unavailable; width just won't persist
  }
}

export function LearnTreeResizeHandle() {
  const { t } = useT();
  const handleRef = useRef<HTMLDivElement>(null);

  // Restore before paint, with transitions off, so the saved width doesn't animate in.
  useLayoutEffect(() => {
    const wrapper = handleRef.current && getWrapper(handleRef.current);
    let stored: number;
    try {
      stored = Number(localStorage.getItem(STORAGE_KEY));
    } catch {
      return;
    }
    if (!wrapper || !stored) {
      return;
    }
    wrapper.dataset.resizing = "";
    applyWidth(wrapper, clampWidth(stored));
    // Force a style flush so the width commits before transitions come back.
    void wrapper.offsetWidth;
    delete wrapper.dataset.resizing;
  }, []);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const handle = event.currentTarget;
    const wrapper = getWrapper(handle);
    const sidebarLeft = handle.parentElement?.getBoundingClientRect().left ?? 0;
    if (!wrapper) {
      return;
    }
    event.preventDefault();
    handle.setPointerCapture(event.pointerId);
    wrapper.dataset.resizing = "";
    let width = handle.parentElement?.offsetWidth ?? MIN_WIDTH;

    function handlePointerMove(moveEvent: globalThis.PointerEvent) {
      width = clampWidth(moveEvent.clientX - sidebarLeft);
      applyWidth(wrapper!, width);
    }

    function handlePointerUp() {
      handle.removeEventListener("pointermove", handlePointerMove);
      delete wrapper!.dataset.resizing;
      saveWidth(width);
    }

    handle.addEventListener("pointermove", handlePointerMove);
    handle.addEventListener("pointerup", handlePointerUp, { once: true });
    handle.addEventListener("pointercancel", handlePointerUp, { once: true });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const direction = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    const wrapper = getWrapper(event.currentTarget);
    if (!direction || !wrapper) {
      return;
    }
    event.preventDefault();
    const width = clampWidth(
      (event.currentTarget.parentElement?.offsetWidth ?? MIN_WIDTH) + direction * KEYBOARD_STEP
    );
    applyWidth(wrapper, width);
    saveWidth(width);
  }

  return (
    <div
      ref={handleRef}
      role="separator"
      aria-orientation="vertical"
      aria-label={t("learn.detail.resizeContents")}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      className="absolute inset-y-0 -right-1 z-20 hidden w-2 cursor-col-resize touch-none outline-none after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2 hover:after:bg-sidebar-border focus-visible:after:bg-ring md:block"
    />
  );
}
