"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "side-nav-open";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
}

function getServerSnapshot() {
  return true;
}

/** Open state of the main side nav, kept in localStorage so it survives page navigation. */
export function useSideNavOpen() {
  const open = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setOpen = useCallback((value: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      // storage unavailable; state just won't persist
    }
    listeners.forEach((listener) => listener());
  }, []);

  return [open, setOpen] as const;
}
