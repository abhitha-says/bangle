import Image from "next/image";
import Link from "next/link";
import { InstagramIcon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { IMG } from "@/data/images";
import { site } from "@/data/site";
import type { ProductImage } from "@/data/types";
import { instagramUrl } from "@/lib/contact";
import styles from "./InstagramGrid.module.css";

/**
 * Instagram inspiration. A live feed needs an Instagram API token, so this is a
 * curated mosaic of our own photographs. Each tile opens the related piece.
 * Once `site.instagram` is set, the follow button links to the profile.
 */
const TILES: { img: ProductImage; href: string; label: string }[] = [
  { img: IMG.emeraldLifestyle, href: "/shop/panna-emerald", label: "Panna" },
  { img: IMG.rubyStyled, href: "/shop/sindoor-ruby-red", label: "Sindoor" },
  { img: IMG.purplePortrait, href: "/shop?colour=pink", label: "Rani pink" },
  { img: IMG.amethystStyled, href: "/shop/jamuni-amethyst-citrine", label: "Jamuni" },
  { img: IMG.emeraldSilk, href: "/shop/panna-emerald", label: "Panna" },
  { img: IMG.quartet, href: "/shop", label: "The collection" },
];

export function InstagramGrid() {
  const profile = site.instagram ? instagramUrl(site.instagram) : null;
  return (
    <section className={styles.section} aria-labelledby="insta-title">
      <div className={`container ${styles.head}`}>
        <Reveal>
          <p className="eyebrow">On Instagram · {site.hashtag}</p>
        </Reveal>
        <Reveal as="h2" id="insta-title" className="display h-lg" index={1}>
          Follow the <em>adornment</em>
        </Reveal>
        <Reveal index={2}>
          {profile ? (
            <a href={profile} target="_blank" rel="noopener noreferrer" className="btn">
              <InstagramIcon /> Follow on Instagram
            </a>
          ) : (
            <span className={styles.soon} aria-disabled="true">
              <InstagramIcon /> Follow on Instagram <small>Coming soon</small>
            </span>
          )}
        </Reveal>
      </div>

      <ul className={styles.mosaic}>
        {TILES.map((t, i) => (
          <Reveal as="li" key={i} index={i} className={styles.tile}>
            <Link href={t.href} className={styles.link} aria-label={`${t.label}: view the piece`}>
              <Image
                src={t.img.src}
                alt={t.img.alt}
                fill
                sizes="(min-width: 1024px) 17vw, (min-width: 640px) 33vw, 50vw"
                quality={72}
                style={{ objectFit: "cover", objectPosition: t.img.focus ?? "50% 50%" }}
              />
              <span className={styles.overlay} aria-hidden>
                <InstagramIcon />
                <span>{t.label}</span>
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
