"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { Hero } from "@/components/home/Hero";
import { ArrowRight } from "@/components/ui/Icon";
import { STORY_BANGLES } from "./bangles";
import type { Projections, StoryEngine } from "./engine";
import { StoryStatic } from "./StoryStatic";
import styles from "./Story.module.css";
import {
  bands,
  bounds,
  CHAPTERS,
  chapterPhase,
  heroOpacity,
  labelsVisible,
  landed,
  railIndex,
  ROOM_BASE,
  wristOpacity,
} from "./timeline";

const COPY: Record<string, { eyebrow: string; title: React.ReactNode; sub?: string }> = {
  discovery: {
    eyebrow: "I — Discovery",
    title: (
      <>
        Every circle <em>holds a story.</em>
      </>
    ),
    sub: "Seven bangles, one from each VIIRAA colourway, gathered into a single stack.",
  },
  beauty: {
    eyebrow: "II — Beauty",
    title: (
      <>
        Beauty in <em>every detail.</em>
      </>
    ),
    sub: "An expression of elegance, crafted to be cherished.",
  },
  craft: {
    eyebrow: "III — Craftsmanship",
    title: (
      <>
        Tradition in <em>every turn.</em>
      </>
    ),
    sub: "Octagon-cut stones held in gold-tone claws, each set apart by a single gold bead.",
  },
  movement: {
    eyebrow: "IV — Movement",
    title: (
      <>
        An art that <em>moves with you.</em>
      </>
    ),
  },
  layered: {
    eyebrow: "V — Adornment",
    title: (
      <>
        Beauty, layered <em>in elegance.</em>
      </>
    ),
  },
  remember: {
    eyebrow: "V — Adornment",
    title: (
      <>
        Made to adorn. <em>Meant to be remembered.</em>
      </>
    ),
  },
  worn: {
    eyebrow: "V — Adornment",
    title: (
      <>
        Beautiful on its own. <em>Extraordinary when worn.</em>
      </>
    ),
  },
};

const RAIL = ["Discovery", "Beauty", "Craft", "Movement", "Adornment"];
const PORTRAIT = "(max-aspect-ratio: 4/5)";

type Mode = "pending" | "live" | "static";

let support: boolean | null = null;
/** WebGL available and motion welcome? Cached: getSnapshot must be stable. */
function canRun3D(): boolean {
  if (support === null) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) support = false;
    else {
      try {
        const c = document.createElement("canvas");
        support = !!(c.getContext("webgl2") || c.getContext("webgl"));
      } catch {
        support = false;
      }
    }
  }
  return support;
}
const noopSubscribe = () => () => {};

function pickQuality(): "high" | "low" {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 900;
  const weak = (nav.deviceMemory ?? 8) < 4 || (navigator.hardwareConcurrency ?? 8) < 4;
  return coarse || small || weak ? "low" : "high";
}

/**
 * VIIRAA's opening story: the campaign film, then seven bangles that arrive,
 * float, separate, orbit, reassemble and finally carry the eye through their
 * own bore onto a wrist. One pinned stage; scroll is the playhead.
 */
export function Story() {
  // "pending" only during server render; the client decides synchronously.
  const detected = useSyncExternalStore<Mode>(noopSubscribe, () => (canRun3D() ? "live" : "static"), () => "pending");
  const [failed, setFailed] = useState(false);
  const mode: Mode = failed ? "static" : detected;
  const [heroSuspended, setHeroSuspended] = useState(false);
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const heroLayer = useRef<HTMLDivElement>(null);
  const film = useRef<HTMLDivElement>(null);
  const filmVideo = useRef<HTMLVideoElement>(null);
  const room = useRef<HTMLDivElement>(null);
  const bandEls = useRef<(HTMLDivElement | null)[]>([]);
  const chapterEls = useRef<(HTMLDivElement | null)[]>([]);
  const ledgerEls = useRef<(HTMLLIElement | null)[]>([]);
  const labelEls = useRef<(HTMLLIElement | null)[]>([]);
  const railEls = useRef<(HTMLLIElement | null)[]>([]);
  const railEl = useRef<HTMLOListElement>(null);
  const mobileCount = useRef<HTMLParagraphElement>(null);
  const progressBar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (mode !== "live") return;
    const el = root.current;
    const cv = canvas.current;
    if (!el || !cv) return;

    let engine: StoryEngine | null = null;
    let disposed = false;
    let raf = 0;
    let running = false;
    let shown = 0; // smoothed progress
    let last = performance.now();
    let suspended = false;
    let filmLoaded = false;
    const start = performance.now();
    const params = new URLSearchParams(window.location.search);
    const forced = params.get("quality");
    const instant = params.has("instant"); // test hook: no scroll smoothing
    const quality = forced === "low" || forced === "high" ? forced : pickQuality();

    const target = () => {
      const r = el.getBoundingClientRect();
      const len = r.height - window.innerHeight;
      return len > 0 ? Math.min(1, Math.max(0, -r.top / len)) : 0;
    };

    const size = () => {
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      engine?.resize(w, h);
    };

    const applyDom = (p: number, proj: Projections | null) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // film layers
      const ho = heroOpacity(p);
      if (heroLayer.current) heroLayer.current.style.opacity = String(ho);
      if (ho <= 0.001 !== suspended) {
        suspended = ho <= 0.001;
        setHeroSuspended(suspended);
      }
      const wo = wristOpacity(p);
      if (film.current) film.current.style.opacity = String(wo);
      const v = filmVideo.current;
      if (v) {
        if (!filmLoaded && p > bounds("closeup")[0] - 0.08) {
          filmLoaded = true;
          const portrait = window.matchMedia(PORTRAIT).matches;
          v.poster = portrait ? "/media/wrist-poster-portrait.webp" : "/media/wrist-poster.webp";
          v.src = portrait ? "/media/wrist-portrait.mp4" : "/media/wrist-1080.mp4";
          v.load();
        }
        if (wo > 0 && v.paused && filmLoaded) {
          v.muted = true;
          v.play().catch(() => {});
        } else if (wo === 0 && !v.paused) v.pause();
      }

      // the window onto film
      const hole = proj?.hole ?? { x: w / 2, y: h / 2, r: p <= 0.0001 ? Math.hypot(w, h) : Math.hypot(w, h) };
      const rm = room.current;
      if (rm) {
        rm.style.setProperty("--hx", `${hole.x.toFixed(1)}px`);
        rm.style.setProperty("--hy", `${hole.y.toFixed(1)}px`);
        rm.style.setProperty("--hr", `${Math.max(-2, hole.r).toFixed(1)}px`);
        rm.style.visibility = p >= bounds("worn")[0] + 0.004 ? "hidden" : "visible";
      }

      // colour bands
      bands(p).forEach((b, i) => {
        const e = bandEls.current[i];
        if (e) e.style.clipPath = b.rise >= 0.999 ? "none" : `inset(${((1 - b.rise) * 100).toFixed(2)}% 0 0 0)`;
      });

      // copy
      CHAPTERS.forEach((c, i) => {
        const e = chapterEls.current[i];
        if (!e) return;
        const ph = chapterPhase(p, c);
        const vis = ph <= 1 ? ph : 2 - ph;
        const y = ph <= 1 ? (1 - ph) * 48 : -(ph - 1) * 48;
        e.style.opacity = vis.toFixed(3);
        e.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
        e.style.visibility = vis > 0.002 ? "visible" : "hidden";
      });

      // arrival ledger
      const n = landed(p);
      ledgerEls.current.forEach((e, i) => {
        if (!e) return;
        const a = Math.min(1, Math.max(0, n - i));
        const fade = 1;
        e.style.opacity = (a * fade).toFixed(3);
        e.style.transform = `translate3d(${((1 - a) * -14).toFixed(1)}px, 0, 0)`;
      });
      if (mobileCount.current) {
        const k = Math.max(1, Math.min(STORY_BANGLES.length, Math.round(n)));
        const b = STORY_BANGLES[k - 1];
        mobileCount.current.textContent = `${String(k).padStart(2, "0")} / 07 · ${b.name}, ${b.colour}`;
        const show = p > bounds("settle")[0] + 0.02 && p < bounds("float")[0] + 0.01;
        mobileCount.current.style.opacity = show ? "1" : "0";
      }

      // exploded-view labels
      const lv = labelsVisible(p);
      labelEls.current.forEach((e, i) => {
        if (!e) return;
        const a = proj?.labels[i];
        if (!a || lv <= 0.001) {
          e.style.opacity = "0";
          return;
        }
        e.style.opacity = (lv * (a.behind ? 0 : 1)).toFixed(3);
        e.style.transform = `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0)`;
      });

      // rail + progress (the rail steps aside for the labels)
      const ri = railIndex(p);
      const close = Math.min(1, Math.max(0, (p - bounds("closeup")[0]) / 0.02)) * (p < bounds("worn")[0] ? 1 : 0);
      if (railEl.current) railEl.current.style.opacity = (1 - Math.max(lv, close)).toFixed(3);
      railEls.current.forEach((e, i) => e?.classList.toggle(styles.railOn, i === ri));
      if (progressBar.current) progressBar.current.style.transform = `scaleX(${p.toFixed(4)})`;
      el.dataset.dark = String(p > bounds("separate")[0] + 0.015 && p < bounds("reassemble")[0] + 0.03);
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const goal = target();
      // weighted easing toward the scroll position: smooth, never laggy
      shown = instant ? goal : shown + (goal - shown) * (1 - Math.exp(-dt * 9));
      if (Math.abs(goal - shown) < 0.00005) shown = goal;
      const proj = engine ? engine.frame(shown, (now - start) / 1000) : null;
      applyDom(shown, proj);
      if (running) raf = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
      engine?.resetTiming();
    };

    shown = target();
    applyDom(shown, null);

    import("./engine")
      .then(({ StoryEngine }) => {
        if (disposed) return;
        try {
          engine = new StoryEngine(cv, quality, !(forced === "low" || forced === "high"));
          size();
          el.dataset.ready = "true";
        } catch {
          setFailed(true);
        }
      })
      .catch(() => setFailed(true));

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? startLoop() : stopLoop()), { rootMargin: "100px 0px" });
    io.observe(el);
    const ro = new ResizeObserver(size);
    ro.observe(cv);

    return () => {
      disposed = true;
      stopLoop();
      io.disconnect();
      ro.disconnect();
      engine?.dispose();
      engine = null;
    };
  }, [mode]);

  if (mode === "static") return <StoryStatic />;

  return (
    <section ref={root} className={styles.story} aria-label="The VIIRAA story" data-ready="false">
      <div className={styles.stage}>
        <div ref={heroLayer} className={styles.heroLayer}>
          <Hero suspended={heroSuspended} />
        </div>

        <div ref={film} className={styles.film} aria-hidden style={{ opacity: 0 }}>
          <video ref={filmVideo} muted loop playsInline preload="none" disablePictureInPicture tabIndex={-1} />
          <span className={styles.filmShade} />
        </div>

        <div ref={room} className={styles.room} style={{ "--room": ROOM_BASE } as CSSProperties} aria-hidden>
          {bands(0).map((b, i) => (
            <div
              key={i}
              ref={(e) => {
                bandEls.current[i] = e;
              }}
              className={styles.band}
              style={{ background: b.color, clipPath: "inset(100% 0 0 0)" }}
            />
          ))}
        </div>

        <canvas ref={canvas} className={styles.canvas} aria-hidden />

        <div className={styles.copy}>
          {CHAPTERS.map((c, i) => {
            const copy = COPY[c.id];
            return (
              <div
                key={c.id}
                ref={(e) => {
                  chapterEls.current[i] = e;
                }}
                className={`${styles.chapter} ${c.dark ? styles.dark : ""} ${c.id === "worn" ? styles.worn : ""}`}
                style={{ opacity: 0, visibility: "hidden" }}
              >
                <p className={styles.eyebrow}>{copy.eyebrow}</p>
                <h2 className={styles.title}>{copy.title}</h2>
                {copy.sub && <p className={styles.sub}>{copy.sub}</p>}
                {c.id === "discovery" && (
                  <ol className={styles.ledger} aria-hidden>
                    {STORY_BANGLES.map((b, i) => (
                      <li
                        key={i}
                        ref={(e) => {
                          ledgerEls.current[i] = e;
                        }}
                        style={{ opacity: 0 }}
                      >
                        <span className={styles.ledgerNum}>{String(i + 1).padStart(2, "0")}</span>
                        <span className={styles.ledgerGem} style={{ background: b.stoneLight }} />
                        <span>{b.name}</span>
                        <em>{b.colour}</em>
                      </li>
                    ))}
                  </ol>
                )}
                {c.id === "worn" && (
                  <Link href="/shop" className={`btn btn--light ${styles.cta}`}>
                    Explore the Collection <ArrowRight className="arrow" />
                  </Link>
                )}
              </div>
            );
          })}


          <p ref={mobileCount} className={styles.mobileCount} aria-hidden />
        </div>

        <ul className={styles.labels} aria-hidden>
          {STORY_BANGLES.map((b, i) => (
            <li
              key={i}
              ref={(e) => {
                labelEls.current[i] = e;
              }}
              style={{ opacity: 0 }}
            >
              <i />
              <span>
                {b.name} <em>· {b.colour}</em>
              </span>
            </li>
          ))}
        </ul>

        <ol ref={railEl} className={styles.rail} aria-hidden>
          {RAIL.map((r, i) => (
            <li
              key={r}
              ref={(e) => {
                railEls.current[i] = e;
              }}
            >
              <span>{["I", "II", "III", "IV", "V"][i]}</span>
              <em>{r}</em>
            </li>
          ))}
        </ol>
        <span className={styles.progress} aria-hidden>
          <span ref={progressBar} />
        </span>
      </div>
    </section>
  );
}
