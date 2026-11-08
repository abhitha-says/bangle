"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useEscape, useScrollLock } from "@/components/layout/useScrollLock";
import { ArrowLeft, ArrowRight, CloseIcon, ExpandIcon } from "@/components/ui/Icon";
import type { ProductImage } from "@/data/types";
import styles from "./Gallery.module.css";

export interface GalleryView {
  img: ProductImage;
  label: string;
  /** A closer look at the same, untouched photograph (CSS zoom only). */
  zoom?: { scale: number; origin: string };
}

function ViewImage({ view, sizes, eager }: { view: GalleryView; sizes: string; eager?: boolean }) {
  const cutout = view.img.kind === "cutout";
  return (
    <div className={`${styles.viewInner} ${cutout ? "studio" : ""}`}>
      <div
        className={styles.zoomBox}
        style={view.zoom ? { transform: `scale(${view.zoom.scale})`, transformOrigin: view.zoom.origin } : undefined}
      >
        <Image
          src={view.img.src}
          alt={view.zoom ? `${view.img.alt} (detail)` : view.img.alt}
          fill
          sizes={view.zoom ? "(min-width: 1024px) 80vw, 160vw" : sizes}
          quality={view.zoom ? 90 : 82}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined}
          style={{ objectFit: cutout ? "contain" : "cover", objectPosition: view.img.focus ?? "50% 50%" }}
        />
      </div>
    </div>
  );
}

export function Gallery({ views, name }: { views: GalleryView[]; name: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const sizes = "(min-width: 1024px) 52vw, 100vw";

  const go = useCallback(
    (i: number) => {
      const n = (i + views.length) % views.length;
      setActive(n);
      const t = track.current;
      if (t && t.scrollWidth > t.clientWidth) t.scrollTo({ left: n * t.clientWidth, behavior: "smooth" });
    },
    [views.length],
  );

  const onTrackScroll = () => {
    const t = track.current;
    if (!t || t.scrollWidth <= t.clientWidth) return;
    const i = Math.round(t.scrollLeft / t.clientWidth);
    if (i !== active) setActive(i);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(active + 1);
    if (e.key === "ArrowLeft") go(active - 1);
  };

  return (
    <div className={styles.gallery} onKeyDown={onKey}>
      {views.length > 1 && (
        <ul className={styles.thumbs} aria-label={`${name} views`}>
          {views.map((v, i) => (
            <li key={i}>
              <button
                type="button"
                className={`${styles.thumb} ${i === active ? styles.thumbOn : ""} ${v.img.kind === "cutout" ? "studio" : ""}`}
                onClick={() => go(i)}
                aria-label={`Show view ${i + 1}: ${v.label}`}
                aria-current={i === active}
              >
                <span
                  className={styles.thumbImg}
                  style={v.zoom ? { transform: `scale(${v.zoom.scale})`, transformOrigin: v.zoom.origin } : undefined}
                >
                  <Image
                    src={v.img.src}
                    alt=""
                    fill
                    sizes="80px"
                    quality={72}
                    style={{ objectFit: v.img.kind === "cutout" ? "contain" : "cover", objectPosition: v.img.focus }}
                  />
                </span>
              </button>
              <span className={styles.thumbLabel}>{v.label}</span>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.stage}>
        <div ref={track} className={styles.track} onScroll={onTrackScroll} tabIndex={0} aria-roledescription="carousel" aria-label={`${name} photographs`}>
          {views.map((v, i) => (
            <figure
              key={i}
              className={`${styles.view} ${i === active ? styles.viewOn : ""}`}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${views.length}: ${v.label}`}
              aria-hidden={i !== active || undefined}
            >
              <button type="button" className={styles.open} onClick={() => setLightbox(true)} tabIndex={i === active ? 0 : -1} aria-label={`Enlarge ${v.label.toLowerCase()} view`}>
                <ViewImage view={v} sizes={sizes} eager={i === 0} />
              </button>
            </figure>
          ))}
        </div>

        <div className={styles.overlayUi}>
          <span className={styles.label} key={active}>
            {views[active].label}
          </span>
          <span className={styles.counter}>
            {String(active + 1).padStart(2, "0")} / {String(views.length).padStart(2, "0")}
          </span>
        </div>
        <ExpandIcon className={styles.expand} aria-hidden />

        {views.length > 1 && (
          <>
            <div className={styles.dots} aria-hidden>
              {views.map((_, i) => (
                <i key={i} className={i === active ? styles.dotOn : ""} />
              ))}
            </div>
            <button type="button" className={`${styles.arrow} ${styles.prev}`} onClick={() => go(active - 1)} aria-label="Previous view">
              <ArrowLeft />
            </button>
            <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={() => go(active + 1)} aria-label="Next view">
              <ArrowRight />
            </button>
          </>
        )}
      </div>

      <Lightbox open={lightbox} onClose={() => setLightbox(false)} views={views} index={active} onIndex={go} name={name} />
    </div>
  );
}

function Lightbox({
  open,
  onClose,
  views,
  index,
  onIndex,
  name,
}: {
  open: boolean;
  onClose: () => void;
  views: GalleryView[];
  index: number;
  onIndex: (i: number) => void;
  name: string;
}) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const closeBtn = useRef<HTMLButtonElement>(null);
  useScrollLock(open);
  useEscape(open, onClose);

  // Reset zoom whenever the view changes or the lightbox reopens.
  const viewKey = `${index}:${open}`;
  const [prevKey, setPrevKey] = useState(viewKey);
  if (prevKey !== viewKey) {
    setPrevKey(viewKey);
    setZoomed(false);
  }

  useEffect(() => {
    if (open) closeBtn.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onIndex(index + 1);
      if (e.key === "ArrowLeft") onIndex(index - 1);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, index, onIndex]);

  const pos = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  // Portal to <body>: the sticky gallery column is its own stacking context.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const v = views[index];
  const cutout = v.img.kind === "cutout";
  if (!mounted) return null;

  return createPortal(
    <div className={`${styles.lb} ${open ? styles.lbOpen : ""}`} role="dialog" aria-modal="true" aria-label={`${name}, enlarged`} aria-hidden={!open} inert={!open}>
      {open && (
        <>
          <div
            className={`${styles.lbStage} ${zoomed ? styles.lbZoomed : ""} ${cutout ? "studio" : ""}`}
            onClick={(e) => {
              pos(e as unknown as React.PointerEvent);
              setZoomed((z) => !z);
            }}
            onPointerMove={(e) => zoomed && pos(e)}
          >
            <div className={styles.lbImg} style={{ transformOrigin: origin }}>
              <Image
                key={index}
                src={v.img.src}
                alt={v.img.alt}
                fill
                sizes="100vw"
                quality={90}
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>
          <div className={styles.lbBar}>
            <span>
              {name} · {v.label}
            </span>
            <span className={styles.lbHint}>{zoomed ? "Move to explore, tap to zoom out" : "Tap the image to zoom"}</span>
          </div>
          <button ref={closeBtn} type="button" className={styles.lbClose} onClick={onClose} aria-label="Close enlarged view">
            <CloseIcon />
          </button>
          {views.length > 1 && (
            <>
              <button type="button" className={`${styles.lbArrow} ${styles.lbPrev}`} onClick={() => onIndex(index - 1)} aria-label="Previous view">
                <ArrowLeft />
              </button>
              <button type="button" className={`${styles.lbArrow} ${styles.lbNext}`} onClick={() => onIndex(index + 1)} aria-label="Next view">
                <ArrowRight />
              </button>
            </>
          )}
        </>
      )}
    </div>,
    document.body,
  );
}
