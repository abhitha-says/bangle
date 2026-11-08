"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { ArrowRight } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { colours } from "@/data/colours";
import { IMG } from "@/data/images";
import type { ColourId, ProductImage } from "@/data/types";
import { filterProducts } from "@/lib/catalog";
import styles from "./ShopByColour.module.css";

const HERO_FOR: Record<ColourId, { img: ProductImage; name: string }> = {
  red: { img: IMG.rubyStudio, name: "Sindoor" },
  pink: { img: IMG.raniStudio, name: "Rani" },
  blue: { img: IMG.sapphireStudio, name: "Neelam" },
  green: { img: IMG.oliveStudio, name: "Mehendi" },
  purple: { img: IMG.amethystStudio, name: "Jamuni" },
  multi: { img: IMG.gradientStudio, name: "Phulkari" },
};

export function ShopByColour() {
  const [active, setActive] = useState(0);
  const section = useRef<HTMLElement>(null);
  /** Set when a touch has just chosen a new colour, so that tap previews instead of navigating. */
  const touchPicked = useRef(false);
  const colour = colours[active];

  // Touch screens: touching a colour switches the gem (as hovering does on
  // desktop); touching the colour already shown opens it in the shop.
  const onPointerDown = (e: React.PointerEvent, i: number) => {
    if (e.pointerType === "mouse") return;
    touchPicked.current = i !== active;
    if (i !== active) setActive(i);
  };
  const onClick = (e: React.MouseEvent) => {
    if (touchPicked.current) {
      e.preventDefault();
      touchPicked.current = false;
    }
  };

  return (
    <section
      ref={section}
      id="colours"
      className={styles.section}
      style={{ "--wash": colour.wash, "--gem": colour.swatch.startsWith("#") ? colour.swatch : "#a8865a" } as CSSProperties}
      aria-labelledby="colour-title"
    >
      <div className={`container ${styles.grid}`}>
        <div className={styles.listCol}>
          <Reveal className={styles.kicker}>
            <p className="eyebrow">Shop by colour</p>
          </Reveal>
          <Reveal as="h2" id="colour-title" className={`display h-lg ${styles.title}`} index={1}>
            Choose your <em>shade</em>
          </Reveal>
          <ul className={styles.list}>
            {colours.map((c, i) => {
              const count = filterProducts({ colour: c.id }).length;
              return (
                <Reveal as="li" key={c.id} index={i + 2}>
                  <Link
                    href={`/shop?colour=${c.id}`}
                    className={`${styles.row} ${i === active ? styles.rowOn : ""}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onPointerDown={(e) => onPointerDown(e, i)}
                    onClick={onClick}
                  >
                    <span className={styles.gem} style={{ background: c.swatch }} aria-hidden />
                    <span className={styles.hindi}>{c.hindi}</span>
                    <span className={styles.name}>{c.name}</span>
                    <span className={styles.count}>
                      {count} {count === 1 ? "piece" : "pieces"}
                    </span>
                    <ArrowRight className={styles.arrow} />
                  </Link>
                </Reveal>
              );
            })}
          </ul>
          <p className={styles.touchHint}>Touch a colour to see it · touch again to explore</p>
        </div>

        <div className={styles.stage} aria-hidden>
          <div className={styles.halo} />
          {colours.map((c, i) => {
            const h = HERO_FOR[c.id];
            return (
              <div key={c.id} className={`${styles.piece} ${i === active ? styles.pieceOn : ""}`}>
                <Image
                  src={h.img.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 38vw, 70vw"
                  quality={82}
                  loading={i === 0 ? "eager" : "lazy"}
                  style={{ objectFit: "contain" }}
                />
              </div>
            );
          })}
          <p className={styles.stageCaption}>
            <span key={colour.id}>
              {HERO_FOR[colour.id].name} <em>· {colour.name}</em>
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
