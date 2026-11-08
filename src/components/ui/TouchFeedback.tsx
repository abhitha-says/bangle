"use client";

import { useEffect } from "react";

/**
 * Touch screens have no hover, so buttons and underlined links would never
 * show their desktop animation. On touch, mark the pressed element for a
 * moment: CSS (.is-tapped) then plays the same fill / underline as hover.
 */
export function TouchFeedback() {
  useEffect(() => {
    const timers = new WeakMap<Element, ReturnType<typeof setTimeout>>();
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      const el = (e.target as Element | null)?.closest?.(".btn, .link-line");
      if (!el || el.getAttribute("aria-disabled") === "true") return;
      el.classList.add("is-tapped");
      clearTimeout(timers.get(el));
      timers.set(el, setTimeout(() => el.classList.remove("is-tapped"), 700));
    };
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);
  return null;
}
