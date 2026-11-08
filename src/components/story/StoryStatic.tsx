import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { ArrowRight } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { IMG } from "@/data/images";
import type { ProductImage } from "@/data/types";
import styles from "./StoryStatic.module.css";

/**
 * The same story, told in still photographs, for reduced-motion visitors and
 * devices without WebGL. Nothing is pinned and nothing moves on its own.
 */
const SCENES: { eyebrow: string; title: React.ReactNode; sub: string; img: ProductImage }[] = [
  {
    eyebrow: "I — Discovery",
    title: (
      <>
        Every circle <em>holds a story.</em>
      </>
    ),
    sub: "Bangles from every VIIRAA colourway, side by side on golden silk.",
    img: IMG.quartet,
  },
  {
    eyebrow: "II — Beauty",
    title: (
      <>
        Beauty in <em>every detail.</em>
      </>
    ),
    sub: "An expression of elegance, crafted to be cherished.",
    img: IMG.amethystStyled,
  },
  {
    eyebrow: "V — Adornment",
    title: (
      <>
        Beautiful on its own. <em>Extraordinary when worn.</em>
      </>
    ),
    sub: "Octagon-cut stones, gold-tone claws, a gold bead at every turn.",
    img: IMG.emeraldLifestyle,
  },
];

export function StoryStatic() {
  return (
    <>
      <Hero />
      <section className={styles.static} aria-label="The VIIRAA story">
        {SCENES.map((s, i) => (
          <div key={i} className={`container ${styles.row} ${i % 2 ? styles.flip : ""}`}>
            <Reveal className={styles.text}>
              <p className="eyebrow">{s.eyebrow}</p>
              <h2 className="display h-lg">{s.title}</h2>
              <p className="lede">{s.sub}</p>
              {i === SCENES.length - 1 && (
                <Link href="/shop" className="btn">
                  Explore the Collection <ArrowRight className="arrow" />
                </Link>
              )}
            </Reveal>
            <div className={styles.frame}>
              <Image src={s.img.src} alt={s.img.alt} fill sizes="(min-width: 900px) 45vw, 92vw" quality={82} style={{ objectFit: "cover", objectPosition: s.img.focus }} />
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
