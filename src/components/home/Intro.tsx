import Image from "next/image";
import Link from "next/link";
import { Parallax } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRight } from "@/components/ui/Icon";
import { IMG } from "@/data/images";
import styles from "./Intro.module.css";

export function Intro() {
  return (
    <section id="maison" className={styles.intro} aria-labelledby="maison-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.text}>
          <Reveal className={styles.kicker}>
            <span className="eyebrow">The Maison</span>
            <span className="ornament" aria-hidden>
              <i />
            </span>
          </Reveal>
          <Reveal as="h2" id="maison-title" className={`display ${styles.statement}`} index={1}>
            Bangles have always <em>spoken</em> before the woman wearing them.
          </Reveal>
          <Reveal className={styles.body} index={2}>
            <p>
              A soft chime at a wedding. A flash of colour at a festival. A wrist stacked high for a sister&rsquo;s mehendi.
              VIIRAA gathers that language into jewel-toned stacks: rows of faceted stones held in gold-tone claws, each set
              apart by a tiny gold bead, made to be worn together.
            </p>
            <p>
              Ruby for celebration, emerald for the festive season, and a duet of amethyst and amber for the evenings in
              between. This is adornment as a ritual. <em>The Art of Adornment.</em>
            </p>
          </Reveal>
          <Reveal index={3}>
            <Link href="/shop" className={styles.more}>
              <span className="link-line link-line--always">Explore the collection</span>
              <ArrowRight />
            </Link>
          </Reveal>
        </div>

        <div className={styles.visual}>
          <Reveal variant="mask" className={styles.arch}>
            <Parallax strength={7}>
              <Image
                src={IMG.purplePortrait.src}
                alt={IMG.purplePortrait.alt}
                fill
                sizes="(min-width: 1024px) 34vw, (min-width: 640px) 60vw, 88vw"
                quality={82}
                style={{ objectFit: "cover", objectPosition: IMG.purplePortrait.focus }}
              />
            </Parallax>
          </Reveal>
          <Reveal variant="mask" className={styles.detail} delay={250}>
            <Parallax strength={10}>
              <Image
                src={IMG.plumWrist.src}
                alt={IMG.plumWrist.alt}
                fill
                sizes="(min-width: 1024px) 16vw, 40vw"
                quality={82}
                style={{ objectFit: "cover", objectPosition: "45% 40%" }}
              />
            </Parallax>
          </Reveal>
          <p className={styles.caption} aria-hidden>
            <span>Worn in stacks</span>
          </p>
        </div>
      </div>
    </section>
  );
}
