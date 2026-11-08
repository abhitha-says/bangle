import { InstagramIcon, MailIcon } from "@/components/ui/Icon";
import type { Product } from "@/data/types";
import { contactLinksFor } from "@/lib/contact";
import styles from "./ContactSeller.module.css";

/**
 * Two ways to reach the seller. No cart, no checkout: VIIRAA is a showcase.
 * Buttons go live automatically once the seller's details are added in
 * `src/data/sellers.ts`; until then they read "Coming soon".
 */
export function ContactSeller({ product }: { product: Product }) {
  const links = contactLinksFor(product);
  const anyLive = Boolean(links.instagram || links.email);

  return (
    <section id="enquire" className={styles.box} aria-labelledby="enquire-title">
      <div className={styles.head}>
        <h2 id="enquire-title" className={styles.title}>
          Contact the seller
        </h2>
        {!anyLive && <span className={styles.badge}>Coming soon</span>}
      </div>
      <p className={styles.text}>
        {anyLive
          ? `Message ${links.sellerName} about ${product.name} to ask about sizes and availability.`
          : "Seller contact is coming soon. Instagram and email enquiries for every piece will open here shortly."}
      </p>

      <div className={styles.actions}>
        {links.instagram ? (
          <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="btn btn--solid btn--block">
            <InstagramIcon /> Contact on Instagram
          </a>
        ) : (
          <span className={`btn btn--block ${styles.soon}`} aria-disabled="true" role="link">
            <InstagramIcon /> Contact on Instagram
            <small>Coming soon</small>
          </span>
        )}
        {links.email ? (
          <a href={links.email} className="btn btn--block">
            <MailIcon /> Email Seller
          </a>
        ) : (
          <span className={`btn btn--block ${styles.soon}`} aria-disabled="true" role="link">
            <MailIcon /> Email Seller
            <small>Coming soon</small>
          </span>
        )}
      </div>

      <p className={styles.note}>
        A showcase, not a shop: there is no online checkout. Pieces are reserved directly with the seller.
      </p>
    </section>
  );
}
