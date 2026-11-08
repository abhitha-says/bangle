import Link from "next/link";
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
  return (
    <nav aria-label="Breadcrumb" className={styles.crumbs}>
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
