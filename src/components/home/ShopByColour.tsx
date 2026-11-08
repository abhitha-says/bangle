"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
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
  const [interacting, setInteracting] = useState(false);
  const section = useRef<HTMLElement>(null);
  const colour = colours[active];

  // Without hover (touch) the room gently cycles through the gems while in view.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hover = window.matchMedia("(hover: hover)").matches;
    if (reduce || hover || interacting) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e.isIntersecting) timer = setInterval(() => setActive((a) => (a + 1) % colours.length), 2800);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(timer);
    };
  }, [interacting]);

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
          <Reveal>
            <p className="eyebrow">Shop by colour</p>
          </Reveal>
          <Reveal as="h2" id="colour-title" className={`display h-lg ${styles.title}`} index={1}>
            Choose your <em>shade</em>
          </Reveal>
          <ul className={styles.list} onMouseLeave={() => setInteracting(false)}>
            {colours.map((c, i) => {
              const count = filterProducts({ colour: c.id }).length;
              return (
                <Reveal as="li" key={c.id} index={i + 2}>
                  <Link
                    href={`/shop?colour=${c.id}`}
                    className={`${styles.row} ${i === active ? styles.rowOn : ""}`}
                    onMouseEnter={() => {
                      setInteracting(true);
                      setActive(i);
                    }}
                    onFocus={() => {
                      setInteracting(true);
                      setActive(i);
                    }}
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
