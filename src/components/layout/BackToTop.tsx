"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "@/components/ui/Icon";
import styles from "./BackToTop.module.css";

const R = 21;
const C = 2 * Math.PI * R;

/** Appears after the first screen; the ring traces reading progress. */
export function BackToTop() {
  const [show, setShow] = useState(false);
  const ring = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      setShow(window.scrollY > window.innerHeight * 1.2);
      if (ring.current) ring.current.style.strokeDashoffset = String(C * (1 - p));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    document.getElementById("main")?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      className={`${styles.btn} ${show ? styles.show : ""}`}
      onClick={toTop}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
    >
      <svg viewBox="0 0 48 48" className={styles.ring} aria-hidden>
        <circle cx="24" cy="24" r={R} className={styles.track} />
        <circle ref={ring} cx="24" cy="24" r={R} className={styles.progress} strokeDasharray={C} strokeDashoffset={C} />
      </svg>
      <ArrowUp className={styles.arrow} />
    </button>
  );
}
