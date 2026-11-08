import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { ShopExplorer } from "@/components/shop/ShopExplorer";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { products } from "@/lib/catalog";
import styles from "./shop.module.css";

export const metadata: Metadata = {
  title: "The Collection",
  description:
    "Explore every VIIRAA bangle set: ruby, rani pink, sapphire, emerald and olive, amethyst with citrine, and many-hued stacks. Filter by collection or colour.",
  alternates: { canonical: "/shop" },
};

/** Rendered on the server (and for crawlers) before filters hydrate. */
function StaticGrid() {
  return (
    <div className="container">
      <div className={styles.fallbackBar} aria-hidden />
      <ul className={styles.fallbackGrid}>
        {products.map((p, i) => (
          <li key={p.id}>
            <ProductCard product={p} index={i} eager={i < 4} headingLevel="h2" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ShopPage() {
  return (
    <>
      <header className={styles.head}>
        <div className="container">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
          <div className={styles.titleRow}>
            <h1 className="display h-xl">
              The <em>Collection</em>
            </h1>
            <p className={styles.intro}>
              Jewel-toned bangle sets, photographed exactly as they are. Hover for a second view, or swipe on your phone,
              then contact the seller about any piece you love.
            </p>
          </div>
        </div>
      </header>
      <Suspense fallback={<StaticGrid />}>
        <ShopExplorer />
      </Suspense>
    </>
  );
}
