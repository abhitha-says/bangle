"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { ArrowRight, PauseIcon, PlayIcon } from "@/components/ui/Icon";
import { site } from "@/data/site";
import styles from "./Hero.module.css";

/**
 * Three cuts of the same film (see README → Media):
 *  - portrait: 810×1080, re-framed per shot so the jewellery stays in frame
 *              on phones and portrait tablets (pans across the quartet shot)
 *  - sd:       1280×720 for smaller landscape screens or data-saver
 *  - hd:       1920×1080 original
 */
const SOURCES = {
  portrait: "/media/hero-portrait.mp4",
  sd: "/media/hero-720.mp4",
  hd: "/media/hero-1080.mp4",
} as const;
type Cut = keyof typeof SOURCES;

const PORTRAIT_QUERY = "(max-aspect-ratio: 4/5)";

/** Landscape quality is decided once per visit so resizes never reload it. */
let landscapeQuality: "sd" | "hd" | null = null;

function pickCut(): Cut {
  if (window.matchMedia(PORTRAIT_QUERY).matches) return "portrait";
  if (!landscapeQuality) {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const slow = !!conn && (conn.saveData || /(^|-)2g|3g/.test(conn.effectiveType ?? ""));
    const pixels = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
    landscapeQuality = slow || pixels <= 1280 ? "sd" : "hd";
  }
  return landscapeQuality;
}

function subscribeMedia(query: string) {
  return (cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  };
}
const subscribePortrait = subscribeMedia(PORTRAIT_QUERY);
const subscribeReduce = subscribeMedia("(prefers-reduced-motion: reduce)");

const LETTERS = site.name.split("");

export function Hero({ suspended = false }: { suspended?: boolean } = {}) {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  // null on the server: the poster renders first, the film is chosen on the client.
  const cut = useSyncExternalStore<Cut | null>(subscribePortrait, pickCut, () => null);
  const reduceMotion = useSyncExternalStore(
    subscribeReduce,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
  const [playing, setPlaying] = useState(false);
  /** The visitor's explicit choice overrides everything else. */
  const [choice, setChoice] = useState<"play" | "pause" | null>(null);
  /** The browser refused autoplay (e.g. iOS low-power mode). */
  const [blocked, setBlocked] = useState(false);
  const shouldPlay = !suspended && (choice === "play" || (choice === null && !reduceMotion && !blocked));
  const canAutoplay = !reduceMotion && !blocked;
  const visible = useRef(true);

  const tryPlay = useCallback(() => {
    const v = video.current;
    if (!v || !shouldPlay || !visible.current || document.hidden) return;
    v.muted = true;
    v.play().catch((err: DOMException) => {
      // Only a policy refusal means autoplay is blocked. AbortError just means
      // a pause()/load() interrupted this call.
      if (err?.name === "NotAllowedError") setBlocked(true);
    });
  }, [shouldPlay]);

  // Load the chosen source.
  useEffect(() => {
    const v = video.current;
    if (!v || !cut) return;
    const src = SOURCES[cut];
    if (v.dataset.src !== src) {
      const t = v.currentTime;
      v.dataset.src = src;
      v.src = src;
      v.load();
      if (t) v.currentTime = t;
    }
    tryPlay();
  }, [cut, tryPlay]);

  // Pause when the film is off-screen or the tab is hidden; pause on unmount
  // (routes stay mounted but hidden under <Activity>).
  useEffect(() => {
    const v = video.current;
    const el = section.current;
    if (!v || !el) return;
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
      if (e.isIntersecting) tryPlay();
      else v.pause();
    });
    io.observe(el);
    const onVis = () => (document.hidden ? v.pause() : tryPlay());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      v.pause();
    };
  }, [tryPlay]);

  // Scroll-linked depth: the film drifts and the type lifts away.
  useEffect(() => {
    const el = section.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = el.offsetHeight || 1;
      const p = Math.min(1, Math.max(0, window.scrollY / h));
      el.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      setChoice("play");
      v.muted = true;
      v.play().catch((err: DOMException) => err?.name === "NotAllowedError" && setChoice("pause"));
    } else {
      setChoice("pause");
      v.pause();
    }
  };

  return (
    <section ref={section} className={styles.hero} aria-label="VIIRAA, The Art of Adornment">
      <div className={styles.media}>
        {/* Art-directed poster: instant first paint and the no-autoplay fallback. */}
        <picture className={styles.poster}>
          <source media={PORTRAIT_QUERY} srcSet="/media/hero-poster-portrait.webp" type="image/webp" />
          <source media="(max-width: 1280px)" srcSet="/media/hero-poster-720.webp" type="image/webp" />
          <source srcSet="/media/hero-poster.webp" type="image/webp" />
          <img src="/media/hero-poster.jpg" alt="" fetchPriority="high" decoding="async" />
        </picture>
        <video
          ref={video}
          className={`${styles.video} ${playing ? styles.videoOn : ""}`}
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          disableRemotePlayback
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        <div className={styles.scrim} aria-hidden />
      </div>

      <div className={styles.content}>
        <h1 className={styles.title} aria-label={site.name}>
          {LETTERS.map((l, i) => (
            <span key={i} className={styles.letterMask} aria-hidden>
              <span className={styles.letter} style={{ "--i": i } as CSSProperties}>
                {l}
              </span>
            </span>
          ))}
        </h1>
        <p className={styles.tagline}>{site.tagline}</p>
        <div className={styles.ctas}>
          <Link href="/shop" className={`btn btn--light ${styles.primary}`}>
            Shop Collection <ArrowRight className="arrow" />
          </Link>
          <a href="#collections" className={`${styles.secondary} link-line link-line--always`}>
            Discover the Collection
          </a>
        </div>
      </div>

      <div className={styles.footerRow}>
        <a
          href="#collections"
          className={styles.scroll}
          aria-label="Scroll into the story"
          onClick={(e) => {
            e.preventDefault();
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollBy({ top: window.innerHeight, behavior: reduce ? "auto" : "smooth" });
          }}
        >
          <span>Scroll</span>
          <i aria-hidden />
        </a>
        <button
          type="button"
          className={styles.toggle}
          onClick={toggle}
          aria-label={playing ? "Pause the film" : "Play the film"}
          aria-pressed={!playing}
          data-hint={!canAutoplay && !playing ? "Play film" : undefined}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
    </section>
  );
}
