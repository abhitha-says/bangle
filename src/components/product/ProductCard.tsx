"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { ArrowRight } from "@/components/ui/Icon";
import { colourById } from "@/data/colours";
import type { Product, ProductImage } from "@/data/types";
import { collectionName } from "@/lib/catalog";
import styles from "./ProductCard.module.css";

export const CARD_SIZES = "(min-width: 1280px) 24vw, (min-width: 900px) 32vw, (min-width: 360px) 48vw, 92vw";

function Slide({ img, className, sizes, eager }: { img: ProductImage; className: string; sizes: string; eager?: boolean }) {
  const cutout = img.kind === "cutout";
  return (
    <div className={`${styles.slide} ${className} ${cutout ? "studio" : ""}`}>
      <Image
        src={img.src}
        alt={img.alt}
        fill
        sizes={sizes}
        quality={82}
        loading={eager ? "eager" : "lazy"}
        draggable={false}
        style={{ objectFit: cutout ? "contain" : "cover", objectPosition: img.focus ?? "50% 50%" }}
      />
    </div>
  );
}

interface Props {
  product: Product;
  index?: number;
  sizes?: string;
  eager?: boolean;
  headingLevel?: "h2" | "h3";
}

export function ProductCard({ product, index = 0, sizes = CARD_SIZES, eager, headingLevel = "h3" }: Props) {
  const { primary, secondary } = product.images;
  const frame = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const colour = colourById(product.colourId);
  const href = `/shop/${product.slug}`;
  const H = headingLevel;

  // Controlled 3D: a few degrees of tilt and a soft sheen that follows the cursor.
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !frame.current) return;
    const r = frame.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    frame.current.style.setProperty("--rx", `${(0.5 - y) * 5}deg`);
    frame.current.style.setProperty("--ry", `${(x - 0.5) * 6}deg`);
    frame.current.style.setProperty("--mx", `${x * 100}%`);
    frame.current.style.setProperty("--my", `${y * 100}%`);
  };
  const onLeave = () => {
    const f = frame.current;
    if (!f) return;
    f.style.setProperty("--rx", "0deg");
    f.style.setProperty("--ry", "0deg");
  };

  // Touch: the two views sit side by side in a snap track.
  const onTrackScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const t = e.currentTarget;
    setSlide(Math.round(t.scrollLeft / Math.max(1, t.clientWidth)));
  };

  return (
    <article className={styles.card} style={{ "--i": index } as CSSProperties}>
      <Link href={href} className={styles.mediaLink} aria-label={`${product.name}, ${product.colour}`} draggable={false}>
        <div
          ref={frame}
          className={`${styles.frame} ${secondary ? styles.dual : styles.single}`}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
        >
          <div className={styles.track} onScroll={secondary ? onTrackScroll : undefined}>
            <Slide img={primary} className={styles.primary} sizes={sizes} eager={eager} />
            {secondary && <Slide img={secondary} className={styles.secondary} sizes={sizes} />}
          </div>
          <span className={styles.sheen} aria-hidden />
          {secondary && (
            <span className={styles.dots} aria-hidden>
              <i className={slide === 0 ? styles.dotOn : ""} />
              <i className={slide === 1 ? styles.dotOn : ""} />
            </span>
          )}
          {secondary && <span className={styles.viewHint} aria-hidden>{secondary.label ?? "Second view"}</span>}
        </div>
      </Link>

      <div className={styles.info}>
        <p className={styles.meta}>
          <span>{collectionName(product)}</span>
          <span className={styles.sep} aria-hidden />
          <span>{product.category}</span>
        </p>
        <H className={styles.name}>
          <Link href={href}>{product.name}</Link>
        </H>
        <p className={styles.colour}>
          <i style={{ background: colour.swatch }} aria-hidden />
          {product.colour}
        </p>
        <p className={styles.desc}>{product.shortDescription}</p>
        <Link href={`${href}#enquire`} className={styles.cta} aria-label={`Contact seller about ${product.name}`}>
          <span className="link-line">Contact Seller</span>
          <ArrowRight />
        </Link>
      </div>
    </article>
  );
}
