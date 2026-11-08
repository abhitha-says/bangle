import Link from "next/link";
import { collections } from "@/data/collections";
import { colours } from "@/data/colours";
import { site } from "@/data/site";
import { InstagramIcon, MailIcon } from "@/components/ui/Icon";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.intro}>
          <p className={styles.statement}>
            Adornment is a ritual. <em>Take your time.</em>
          </p>
          <div className={styles.soon}>
            <p className="eyebrow">Seller contact</p>
            <p className={styles.soonText}>
              Instagram and email enquiries open soon. Until then, explore the collection and save the pieces you love.
            </p>
            <div className={styles.soonRow}>
              <span className={styles.pill} aria-disabled="true">
                <InstagramIcon /> Instagram <small>Coming soon</small>
              </span>
              <span className={styles.pill} aria-disabled="true">
                <MailIcon /> Email <small>Coming soon</small>
              </span>
            </div>
          </div>
        </div>

        <nav className={styles.cols} aria-label="Footer">
          <div>
            <p className={styles.colTitle}>Shop</p>
            <ul>
              <li>
                <Link href="/shop" className="link-line">
                  All bangles
                </Link>
              </li>
              {collections.map((c) => (
                <li key={c.id}>
                  <Link href={`/shop?collection=${c.id}`} className="link-line">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={styles.colTitle}>Colours</p>
            <ul>
              {colours.map((c) => (
                <li key={c.id}>
                  <Link href={`/shop?colour=${c.id}`} className={`link-line ${styles.colourLink}`}>
                    <i style={{ background: c.swatch }} aria-hidden />
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={styles.colTitle}>Maison</p>
            <ul>
              <li>
                <Link href="/#maison" className="link-line">
                  Our story
                </Link>
              </li>
              <li>
                <Link href="/#craft" className="link-line">
                  The craft
                </Link>
              </li>
              <li>
                <Link href="/contact" className="link-line">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className={styles.mark} aria-hidden>
        VIIRAA
      </div>

      <div className={styles.bottom}>
        <p>© {site.year} VIIRAA. {site.tagline}</p>
        <p>A showcase of our collection. Pieces are not sold online.</p>
      </div>
    </footer>
  );
}
