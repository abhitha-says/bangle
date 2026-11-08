"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Stagger index, multiplied by 90ms. */
  index?: number;
  delay?: number;
  /** "rise" fades up; "mask" wipes the element in from the top. */
  variant?: "rise" | "mask";
  style?: CSSProperties;
  id?: string;
}

/**
 * Adds `is-in` when the element scrolls into view. The "mask" variant clips an
 * inner layer, never the observed element itself: IntersectionObserver treats
 * a fully clipped target as invisible, so it would never reveal.
 * The visual transition lives
 * in globals.css (.reveal / .reveal-mask) so it is cheap and honours
 * prefers-reduced-motion.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className = "",
  index = 0,
  delay = 0,
  variant = "rise",
  style,
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      id={id}
      className={`${variant === "mask" ? "reveal-mask" : "reveal"} ${className}`}
      style={{ "--i": index, "--delay": `${delay}ms`, ...style } as CSSProperties}
    >
      {variant === "mask" ? <span className="reveal-mask__inner">{children}</span> : children}
    </Tag>
  );
}
