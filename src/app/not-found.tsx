import Link from "next/link";
import { ArrowRight } from "@/components/ui/Icon";

export default function NotFound() {
  return (
    <section
      style={{
        minHeight: "80svh",
        display: "grid",
        placeContent: "center",
        justifyItems: "center",
        gap: "1.5rem",
        textAlign: "center",
        padding: "calc(var(--header-h) + 3rem) var(--gutter) 5rem",
      }}
    >
      <p className="eyebrow">404</p>
      <h1 className="display h-lg" style={{ maxWidth: "14ch" }}>
        This piece has <em style={{ color: "var(--wine)" }}>slipped off the wrist.</em>
      </h1>
      <p className="lede">The page you were looking for isn&rsquo;t here. The collection, however, is.</p>
      <Link href="/shop" className="btn">
        Explore the collection <ArrowRight className="arrow" />
      </Link>
    </section>
  );
}
