import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ContactSeller } from "@/components/product/ContactSeller";
import { Gallery, type GalleryView } from "@/components/product/Gallery";
import { MobileEnquireBar } from "@/components/product/MobileEnquireBar";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ArrowLeft, ArrowRight, PlusIcon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { collectionById } from "@/data/collections";
import { colourById } from "@/data/colours";
import { site } from "@/data/site";
import type { Product } from "@/data/types";
import { adjacentProducts, getProduct, products, relatedProducts } from "@/lib/catalog";
import { contactLinksFor } from "@/lib/contact";
import styles from "./product.module.css";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  const title = `${p.name}, ${p.colour} Bangles`;
  return {
    title,
    description: `${p.shortDescription} ${p.description[0]}`.slice(0, 300),
    alternates: { canonical: `/shop/${p.slug}` },
    openGraph: {
      title: `${title} · VIIRAA`,
      description: p.shortDescription,
      images: [{ url: (p.images.secondary ?? p.images.primary).src, alt: p.images.primary.alt }],
    },
  };
}

/** Gallery views use only the supplied photographs; "Detail" is a CSS zoom. */
function viewsFor(p: Product): GalleryView[] {
  const { primary, secondary, gallery = [] } = p.images;
  const views: GalleryView[] = [{ img: primary, label: primary.label ?? "Full set" }];
  if (secondary) views.push({ img: secondary, label: secondary.label ?? "Styled" });
  gallery.forEach((g) => views.push({ img: g, label: g.label ?? "View" }));
  views.push({
    img: primary,
    label: "Detail",
    zoom: primary.kind === "cutout" ? { scale: 2.4, origin: "42% 36%" } : { scale: 1.9, origin: primary.focus ?? "50% 50%" },
  });
  return views;
}

/** Instant client navigations: the shell paints at once, the piece streams in. */
function ProductSkeleton() {
  return (
    <div className={`container ${styles.skeleton}`} aria-busy="true" aria-label="Loading piece">
      <div className={`${styles.skGallery} studio`} />
      <div className={styles.skInfo}>
        <i style={{ width: "40%" }} />
        <i className={styles.skTitle} />
        <i style={{ width: "55%" }} />
        <i style={{ width: "90%" }} />
        <i style={{ width: "80%" }} />
        <i className={styles.skBox} />
      </div>
    </div>
  );
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const collection = collectionById(product.collectionId);
  const colour = colourById(product.colourId);
  const related = relatedProducts(product);
  const { prev, next } = adjacentProducts(product);
  const live = (() => {
    const l = contactLinksFor(product);
    return Boolean(l.instagram || l.email);
  })();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} ${product.colour} Bangle Set`,
    sku: product.id,
    description: product.description.join(" "),
    color: product.colour,
    category: product.category,
    brand: { "@type": "Brand", name: site.name },
    image: [product.images.primary, product.images.secondary].filter(Boolean).map((i) => new URL(i!.src, site.url).toString()),
  };

  return (
    <>
      <div className={`container ${styles.top}`}>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            ...(collection ? [{ label: collection.name, href: `/shop?collection=${collection.id}` }] : []),
            { label: product.name },
          ]}
        />
      </div>

      <article className={`container ${styles.layout}`}>
        <div className={styles.galleryCol}>
          <Gallery views={viewsFor(product)} name={product.name} />
        </div>

        <div className={styles.infoCol}>
          <div className={styles.info}>
            <p className={styles.kicker}>
              <span>{collection?.name}</span>
              <i aria-hidden />
              <span>{collection?.meaning}</span>
              <span className={styles.sku}>{product.id}</span>
            </p>
            <h1 className={styles.name}>{product.name}</h1>
            <p className={styles.colour}>
              <span className={styles.swatch} style={{ background: colour.swatch }} aria-hidden />
              {product.colour}
              <span className={styles.dot} aria-hidden>·</span>
              {product.category}
            </p>
            <p className={styles.short}>{product.shortDescription}</p>
            <div className={styles.desc}>
              {product.description.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <ContactSeller product={product} />

            <div className={styles.accordions}>
              <details className={styles.acc} open>
                <summary>
                  The details <PlusIcon aria-hidden />
                </summary>
                <ul className={styles.detailList}>
                  {product.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                  <li>Collection: {collection?.name}</li>
                  <li>Reference: {product.id}</li>
                </ul>
              </details>
              <details className={styles.acc}>
                <summary>
                  Size &amp; fit <PlusIcon aria-hidden />
                </summary>
                <p>
                  Indian bangle sizes are usually given in inches, from 2.2 to 2.10. Sizes available for {product.name} will be
                  confirmed by the seller when you enquire. If you are between sizes, ask about the larger one: bangles should
                  slip over the hand with gentle pressure.
                </p>
              </details>
              <details className={styles.acc}>
                <summary>
                  Caring for your bangles <PlusIcon aria-hidden />
                </summary>
                <p>
                  Put your bangles on last and take them off first. Keep them away from perfume, water and lotions, wipe them
                  with a soft dry cloth after wearing, and store each set flat in its own pouch so the stones don&rsquo;t knock
                  together.
                </p>
              </details>
              <details className={styles.acc}>
                <summary>
                  How enquiries work <PlusIcon aria-hidden />
                </summary>
                <p>
                  VIIRAA is a showcase. There is no cart or online payment. Reach the seller by Instagram or email (opening
                  soon) to confirm sizes and availability, and to arrange your piece directly with them.
                </p>
              </details>
            </div>
          </div>
        </div>
      </article>

      <nav className={`container ${styles.pager}`} aria-label="More pieces">
        <Link href={`/shop/${prev.slug}`} className={styles.pagerLink}>
          <ArrowLeft className={styles.pagerArrow} />
          <span className={`${styles.pagerThumb} ${prev.images.primary.kind === "cutout" ? "studio" : ""}`}>
            <Image src={prev.images.primary.src} alt="" fill sizes="64px" quality={72} style={{ objectFit: prev.images.primary.kind === "cutout" ? "contain" : "cover" }} />
          </span>
          <span>
            <span className="eyebrow">Previous</span>
            <span className={styles.pagerName}>{prev.name}</span>
          </span>
        </Link>
        <Link href="/shop" className={styles.pagerAll}>
          All pieces
        </Link>
        <Link href={`/shop/${next.slug}`} className={`${styles.pagerLink} ${styles.pagerNext}`}>
          <span>
            <span className="eyebrow">Next</span>
            <span className={styles.pagerName}>{next.name}</span>
          </span>
          <span className={`${styles.pagerThumb} ${next.images.primary.kind === "cutout" ? "studio" : ""}`}>
            <Image src={next.images.primary.src} alt="" fill sizes="64px" quality={72} style={{ objectFit: next.images.primary.kind === "cutout" ? "contain" : "cover" }} />
          </span>
          <ArrowRight className={styles.pagerArrow} />
        </Link>
      </nav>

      <section className={`container ${styles.related}`} aria-labelledby="related-title">
        <Reveal className={styles.relatedHead}>
          <p className="eyebrow">You may also love</p>
          <h2 id="related-title" className="display h-md">
            Pieces that <em>pair well</em>
          </h2>
        </Reveal>
        <ul className={styles.relatedGrid}>
          {related.map((p, i) => (
            <Reveal as="li" key={p.id} index={i}>
              <ProductCard product={p} index={i} />
            </Reveal>
          ))}
        </ul>
      </section>

      <MobileEnquireBar name={product.name} colour={product.colour} live={live} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
