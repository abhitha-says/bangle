"use client";

import { useSyncExternalStore } from "react";

/**
 * Saved pieces (the heart on each card), kept in this browser only.
 * There is no account or checkout; this is a personal shortlist.
 */
const KEY = "viiraa:saved";
const listeners = new Set<() => void>();
let cache: string[] | null = null;
const EMPTY: string[] = [];

function read(): string[] {
  if (cache) return cache;
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    cache = [];
  }
  return cache;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function toggleSaved(id: string) {
  const list = read();
  cache = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* private mode: keep it for this visit */
  }
  listeners.forEach((l) => l());
}

export function useSaved(id: string): boolean {
  return useSyncExternalStore(subscribe, () => read().includes(id), () => false);
}

export function useSavedList(): string[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
