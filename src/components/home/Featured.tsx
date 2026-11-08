import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { ArrowRight } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { featuredProducts } from "@/lib/catalog";
import styles from "./Featured.module.css";

export function Featured() {
  const items = featuredProducts();
  return (
    <section className={styles.section} aria-labelledby="edit-title">
      <div className="container">
        <div className={styles.head}>
          <div>
            <Reveal>
              <p className="eyebrow">The Edit</p>
            </Reveal>
            <Reveal as="h2" id="edit-title" className="display h-lg" index={1}>
              Pieces we <em>keep returning to</em>
            </Reveal>
          </div>
          <Reveal index={2}>
            <Link href="/shop" className={styles.all}>
              <span className="link-line link-line--always">View all pieces</span>
              <ArrowRight />
            </Link>
          </Reveal>
        </div>
        <ul className={styles.grid}>
          {items.map((p, i) => (
            <Reveal as="li" key={p.id} index={i}>
              <ProductCard product={p} index={i} sizes="(min-width: 1100px) 24vw, (min-width: 360px) 46vw, 92vw" />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
