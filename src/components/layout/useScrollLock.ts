"use client";

import { useEffect } from "react";

/** Locks page scroll while `locked` is true, compensating for the scrollbar. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const html = document.documentElement;
    const scrollbar = window.innerWidth - html.clientWidth;
    const prev = { overflow: html.style.overflow, pad: html.style.paddingRight };
    html.style.overflow = "hidden";
    if (scrollbar > 0) html.style.paddingRight = `${scrollbar}px`;
    html.style.setProperty("--scrollbar-comp", `${scrollbar}px`);
    return () => {
      html.style.overflow = prev.overflow;
      html.style.paddingRight = prev.pad;
      html.style.removeProperty("--scrollbar-comp");
    };
  }, [locked]);
}

/** Calls `onEscape` when Escape is pressed while `active`. */
export function useEscape(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onEscape();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [active, onEscape]);
}
