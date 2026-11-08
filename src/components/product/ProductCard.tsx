"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { ArrowRight, CameraIcon, HeartIcon } from "@/components/ui/Icon";
import { colourById } from "@/data/colours";
import type { Product, ProductImage } from "@/data/types";
import { collectionName } from "@/lib/catalog";
import { toggleSaved, useSaved } from "@/lib/saved";
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
  const { primary, side, secondary } = product.images;
  // The card turns to the side view; pieces without one show their styled photo.
  const alt = side ?? secondary;
  const [slide, setSlide] = useState(0);
  const [tryNote, setTryNote] = useState(false);
  const noteTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const saved = useSaved(product.id);
  const colour = colourById(product.colourId);
  const href = `/shop/${product.slug}`;
  const H = headingLevel;

  // Touch: the two views sit side by side in a snap track.
  const onTrackScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const t = e.currentTarget;
    setSlide(Math.round(t.scrollLeft / Math.max(1, t.clientWidth)));
  };

  // Virtual try-on is not built yet: say so plainly instead of a dead button.
  const onTry = () => {
    setTryNote(true);
    clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setTryNote(false), 2600);
  };

  return (
    <article className={styles.card} style={{ "--i": index } as CSSProperties}>
      <div className={styles.media}>
        <Link href={href} className={styles.mediaLink} aria-label={`${product.name}, ${product.colour}`} draggable={false}>
          <div className={`${styles.frame} ${alt ? styles.dual : styles.single}`}>
            <div className={styles.track} onScroll={alt ? onTrackScroll : undefined}>
              <Slide img={primary} className={styles.primary} sizes={sizes} eager={eager} />
              {alt && <Slide img={alt} className={styles.alt} sizes={sizes} />}
            </div>
            {alt && (
              <span className={styles.dots} aria-hidden>
                <i className={slide === 0 ? styles.dotOn : ""} />
                <i className={slide === 1 ? styles.dotOn : ""} />
              </span>
            )}
          </div>
        </Link>

        <button
          type="button"
          className={`${styles.heart} ${saved ? styles.heartOn : ""}`}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from saved pieces` : `Save ${product.name}`}
          onClick={() => toggleSaved(product.id)}
        >
          <HeartIcon filled={saved} />
        </button>

        <div className={styles.actions}>
          <Link href={`/shop?colour=${product.colourId}`} className={styles.action} aria-label={`Pieces similar to ${product.name}`}>
            <i className={styles.actionSwatch} style={{ background: colour.swatch }} aria-hidden />
            <span>Similar</span>
          </Link>
          <button type="button" className={styles.action} onClick={onTry} aria-label={`Try ${product.name} on`}>
            <CameraIcon aria-hidden />
            <span>Try It</span>
          </button>
        </div>
        <p className={`${styles.tryNote} ${tryNote ? styles.tryNoteOn : ""}`} role="status" aria-live="polite">
          {tryNote ? "Virtual try-on is coming soon" : ""}
        </p>
      </div>

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
