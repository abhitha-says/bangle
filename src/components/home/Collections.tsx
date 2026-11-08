import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRight } from "@/components/ui/Icon";
import { collections, productsInCollection } from "@/lib/catalog";
import styles from "./Collections.module.css";

const NUMERALS = ["I", "II", "III", "IV", "V"];

export function Collections() {
  return (
    <section id="collections" className={styles.section} aria-labelledby="collections-title">
      <div className={`container ${styles.head}`}>
        <Reveal>
          <p className="eyebrow">The Collections</p>
        </Reveal>
        <Reveal as="h2" id="collections-title" className="display h-lg" index={1}>
          Three ways to <em>wear colour</em>
        </Reveal>
        <Reveal className="lede" index={2}>
          One shade, a duet, or every hue at once. Each collection is a different conversation between stone and gold.
        </Reveal>
      </div>

      <ol className={styles.rail}>
        {collections.map((c, i) => {
          const count = productsInCollection(c.id).length;
          const cutout = c.cover.kind === "cutout";
          return (
            <Reveal as="li" key={c.id} className={styles.item} index={i}>
              <Link href={`/shop?collection=${c.id}`} className={styles.card}>
                <div className={`${styles.arch} ${cutout ? "studio" : ""}`}>
                  <Image
                    src={c.cover.src}
                    alt={c.cover.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 78vw"
                    quality={82}
                    style={{
                      objectFit: cutout ? "contain" : "cover",
                      objectPosition: c.cover.focus ?? "50% 50%",
                      padding: cutout ? "8% 6% 2%" : undefined,
                    }}
                  />
                  <span className={styles.archLine} aria-hidden />
                </div>
                <div className={styles.meta}>
                  <span className={styles.num}>{NUMERALS[i]}</span>
                  <h3 className={styles.name}>{c.name}</h3>
                  <p className={styles.meaning}>{c.meaning}</p>
                  <p className={styles.desc}>{c.description}</p>
                  <span className={styles.link}>
                    <span className="link-line link-line--always">
                      Explore {count} {count === 1 ? "piece" : "pieces"}
                    </span>
                    <ArrowRight />
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </ol>
    </section>
  );
}
