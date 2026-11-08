import Link from "next/link";
import { ArrowLeft } from "@/components/ui/Icon";
import { site } from "@/data/site";
import styles from "./Breadcrumbs.module.css";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: new URL(c.href, site.url).toString() } : {}),
    })),
  };
  // Phones get one clear way back instead of a wrapping trail.
  const linked = items.slice(0, -1).filter((c) => c.href);
  const back = linked.find((c) => c.href === "/shop") ?? linked[linked.length - 1];
  return (
    <nav aria-label="Breadcrumb" className={styles.crumbs}>
      {back?.href && (
        <Link href={back.href} className={styles.back}>
          <ArrowLeft aria-hidden />
          <span>Back to {back.label.toLowerCase()}</span>
        </Link>
      )}
      <ol>
        {items.map((c, i) => (
          <li key={c.label}>
            {c.href && i < items.length - 1 ? (
              <Link href={c.href} className="link-line">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </nav>
  );
}
