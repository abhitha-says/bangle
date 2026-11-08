"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Moves its child a few percent against the scroll for gentle depth.
 * The child should be slightly oversized (e.g. inset: -8% 0) so edges never show.
 */
export function Parallax({ children, strength = 8, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let inView = false;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // -1 when the element enters at the bottom, +1 when it leaves at the top
      const p = Math.max(-1, Math.min(1, ((vh - r.top) / (vh + r.height)) * 2 - 1));
      el.style.transform = `translate3d(0, ${(-p * strength).toFixed(2)}%, 0)`;
    };
    const onScroll = () => {
      if (inView && !raf) raf = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView) onScroll();
    });
    // Observe the unclipped frame (a mask reveal clips our direct parent).
    io.observe(el.closest(".reveal-mask") ?? el.parentElement ?? el);
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <div ref={ref} className={className} style={{ position: "absolute", inset: `-${strength + 2}% 0`, willChange: "transform" }}>
      {children}
    </div>
  );
}
