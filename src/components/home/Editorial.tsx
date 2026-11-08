import Image from "next/image";
import Link from "next/link";
import { Parallax } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRight } from "@/components/ui/Icon";
import { IMG } from "@/data/images";
import styles from "./Editorial.module.css";

export function Editorial() {
  return (
    <section className={styles.section} aria-labelledby="editorial-title">
      <div className={`container ${styles.grid}`}>
        <Reveal variant="mask" className={`${styles.img} ${styles.a}`}>
          <Parallax strength={6}>
            <Image src={IMG.plumWrist.src} alt={IMG.plumWrist.alt} fill sizes="(min-width: 900px) 55vw, 92vw" quality={82} style={{ objectFit: "cover", objectPosition: "45% 45%" }} />
          </Parallax>
        </Reveal>

        <div className={styles.quote}>
          <Reveal>
            <p className="eyebrow">Editorial · Worn, not kept</p>
          </Reveal>
          <Reveal as="h2" id="editorial-title" className={`display ${styles.q}`} index={1}>
            &ldquo;The chime arrives a moment <em>before she does.</em>&rdquo;
          </Reveal>
          <Reveal className={styles.qText} index={2}>
            Bangles are the one piece of jewellery you hear. We photograph them the way they live: on the wrist, against
            zari and silk, mid-gesture.
          </Reveal>
        </div>

        <Reveal variant="mask" className={`${styles.img} ${styles.b}`} delay={150}>
          <Parallax strength={9}>
            <Image src={IMG.emeraldLifestyle.src} alt={IMG.emeraldLifestyle.alt} fill sizes="(min-width: 900px) 30vw, 70vw" quality={82} style={{ objectFit: "cover", objectPosition: "50% 40%" }} />
          </Parallax>
        </Reveal>

        <Reveal variant="mask" className={`${styles.img} ${styles.c}`}>
          <Parallax strength={7}>
            <Image src={IMG.quartet.src} alt={IMG.quartet.alt} fill sizes="(min-width: 900px) 40vw, 80vw" quality={82} style={{ objectFit: "cover" }} />
          </Parallax>
        </Reveal>

        <Reveal className={styles.cCaption} index={1}>
          <p className={styles.capTitle}>
            Four stacks, <em>one table</em>
          </p>
          <p className={styles.capText}>Ruby, amethyst with amber, sapphire and peridot green on golden silk.</p>
          <Link href="/shop" className={styles.capLink}>
            <span className="link-line link-line--always">Find your colour</span>
            <ArrowRight />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
