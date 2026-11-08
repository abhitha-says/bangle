import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ArrowRight, InstagramIcon, MailIcon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { IMG } from "@/data/images";
import { site } from "@/data/site";
import { instagramUrl, mailtoUrl } from "@/lib/contact";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description: "Seller contact for VIIRAA is coming soon. Instagram and email enquiries will open shortly.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const ig = site.instagram ? instagramUrl(site.instagram) : null;
  const mail = site.email ? mailtoUrl(site.email) : null;

  const channels = [
    { icon: <InstagramIcon />, title: "Instagram", text: "Message us about any piece, sizes and availability.", href: ig, cta: "Open Instagram" },
    { icon: <MailIcon />, title: "Email", text: "Write to the seller and we will reply with details.", href: mail, cta: "Write an email" },
  ];

  return (
    <div className={styles.page}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.text}>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
          <Reveal as="h1" className={`display h-xl ${styles.title}`}>
            Contact, <em>coming soon</em>
          </Reveal>
          <Reveal className="lede" index={1}>
            We are preparing seller contact for every piece. Soon you&rsquo;ll be able to message us on Instagram or email
            the seller directly from any product page. Until then, take your time with the collection.
          </Reveal>

          <ul className={styles.channels}>
            {channels.map((c, i) => (
              <Reveal as="li" key={c.title} index={i + 2} className={styles.channel}>
                <span className={styles.icon}>{c.icon}</span>
                <div>
                  <p className={styles.cTitle}>
                    {c.title}
                    {!c.href && <span className={styles.badge}>Coming soon</span>}
                  </p>
                  <p className={styles.cText}>{c.text}</p>
                  {c.href && (
                    <a href={c.href} className="link-line link-line--always" target={c.title === "Instagram" ? "_blank" : undefined} rel="noopener noreferrer">
                      {c.cta}
                    </a>
                  )}
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal index={4}>
            <Link href="/shop" className="btn">
              Explore the collection <ArrowRight className="arrow" />
            </Link>
          </Reveal>
        </div>

        <Reveal variant="mask" className={styles.visual}>
          <Image
            src={IMG.emeraldSilk.src}
            alt={IMG.emeraldSilk.alt}
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            quality={82}
            style={{ objectFit: "cover", objectPosition: "60% 50%" }}
          />
        </Reveal>
      </div>
    </div>
  );
}
