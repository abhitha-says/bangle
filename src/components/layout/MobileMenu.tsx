"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { collections } from "@/data/collections";
import { colours } from "@/data/colours";
import { IMG } from "@/data/images";
import { site } from "@/data/site";
import type { ProductImage } from "@/data/types";
import styles from "./MobileMenu.module.css";
import { useEscape, useScrollLock } from "./useScrollLock";

const LINKS: { label: string; href: string; note: string; image: ProductImage }[] = [
  { label: "Shop", href: "/shop", note: "The full collection", image: IMG.quartet },
  { label: "Collections", href: "/#collections", note: "Ekrang · Jugalbandi · Satrang", image: IMG.amethystStyled },
  { label: "Colours", href: "/#colours", note: "Ruby to sapphire, and every hue between", image: IMG.rubyStyled },
  { label: "Contact", href: "/contact", note: "Coming soon", image: IMG.emeraldLifestyle },
];

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [active, setActive] = useState(0);
  // Imagery is only requested once the menu has been opened.
  const [primed, setPrimed] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  if (open && !primed) setPrimed(true);
  useScrollLock(open);
  useEscape(open, onClose);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => panel.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true }), 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Keep keyboard focus inside the open menu.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !panel.current) return;
    const items = panel.current.querySelectorAll<HTMLElement>("a, button");
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      id="site-menu"
      className={`${styles.menu} ${open ? styles.open : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden={!open}
      inert={!open}
      onKeyDown={onKeyDown}
    >
      <div className={styles.panel} ref={panel}>
        <nav className={styles.primary} aria-label="Menu">
          <ol>
            {LINKS.map((l, i) => (
              <li key={l.href} style={{ "--i": i } as CSSProperties}>
                <Link
                  href={l.href}
                  onClick={onClose}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={active === i ? styles.current : undefined}
                >
                  <span className={styles.num}>0{i + 1}</span>
                  <span className={styles.label}>{l.label}</span>
                  <span className={styles.note}>{l.note}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.secondary}>
          <div className={styles.group} style={{ "--i": 4 } as CSSProperties}>
            <p className="eyebrow">Collections</p>
            <ul>
              {collections.map((c) => (
                <li key={c.id}>
                  <Link href={`/shop?collection=${c.id}`} onClick={onClose} className="link-line">
                    {c.name} <em>· {c.meaning}</em>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.group} style={{ "--i": 5 } as CSSProperties}>
            <p className="eyebrow">Shop by colour</p>
            <ul className={styles.swatches}>
              {colours.map((c) => (
                <li key={c.id}>
                  <Link href={`/shop?colour=${c.id}`} onClick={onClose} aria-label={c.name} title={c.name}>
                    <span style={{ background: c.swatch }} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <p className={styles.tagline} style={{ "--i": 6 } as CSSProperties}>
            {site.tagline}
          </p>
        </div>
      </div>

      <div className={styles.visual} aria-hidden>
        {primed && LINKS.map((l, i) => (
          <div key={l.href} className={`${styles.visualImg} ${active === i ? styles.visualOn : ""}`}>
            <Image
              src={l.image.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 40vw, 1px"
              quality={82}
              style={{ objectFit: "cover", objectPosition: l.image.focus }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
