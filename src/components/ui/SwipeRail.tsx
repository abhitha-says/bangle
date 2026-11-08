"use client";

import { Children, useRef, useState, type ReactNode } from "react";
import styles from "./SwipeRail.module.css";

/**
 * A horizontal, snap-scrolling rail on touch-width screens (the caller's CSS
 * decides when it scrolls) with dash indicators and a count, so it is obvious
 * there is more to swipe. On wide screens the indicator hides itself.
 */
export function SwipeRail({ children, className, label }: { children: ReactNode; className?: string; label: string }) {
  const ref = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const count = Children.count(children);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const items = [...el.children] as HTMLElement[];
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let dist = Infinity;
    items.forEach((it, i) => {
      const d = Math.abs(it.offsetLeft + it.offsetWidth / 2 - mid);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    if (best !== active) setActive(best);
  };

  const go = (i: number) => {
    const el = ref.current;
    const it = el?.children[i] as HTMLElement | undefined;
    if (el && it) el.scrollTo({ left: it.offsetLeft - (el.clientWidth - it.offsetWidth) / 2, behavior: "smooth" });
  };

  return (
    <>
      <ol ref={ref} className={className} onScroll={onScroll} aria-label={label}>
        {children}
      </ol>
      <div className={styles.indicator}>
        <div className={styles.dashes}>
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              className={i === active ? styles.on : undefined}
              onClick={() => go(i)}
              aria-label={`Show ${i + 1} of ${count}`}
              aria-current={i === active}
            >
              <i />
            </button>
          ))}
        </div>
        <span className={styles.count} aria-hidden>
          {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>
      </div>
    </>
  );
}
