import Image from "next/image";
import Link from "next/link";
import { IMG } from "@/data/images";
import styles from "./EditorialTile.module.css";

/** A campaign moment inside the grid, in the manner of a printed catalogue. */
export function EditorialTile() {
  return (
    <Link href="/#collections" className={styles.tile}>
      <Image
        src={IMG.quartet.src}
        alt={IMG.quartet.alt}
        fill
        sizes="(min-width: 1280px) 48vw, (min-width: 900px) 64vw, 96vw"
        quality={82}
        style={{ objectFit: "cover", objectPosition: "50% 45%" }}
      />
      <span className={styles.shade} aria-hidden />
      <span className={styles.text}>
        <span className="eyebrow">The Collections</span>
        <span className={styles.title}>
          Stone, claw, bead, <em>stack.</em>
        </span>
        <span className={styles.link}>Discover the collections</span>
      </span>
    </Link>
  );
}
