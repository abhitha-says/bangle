"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { IMG } from "@/data/images";
import styles from "./CraftStory.module.css";

/**
 * A sticky macro of one real photograph. As each chapter scrolls past, the
 * camera (a CSS transform on the untouched image) travels to that detail.
 * Origins are percentages of the photo.
 */
const CHAPTERS = [
  {
    num: "I",
    title: "The Stone",
    body: "It begins with colour you can see into. Every stone is cut in an elongated octagon, its facets angled to catch light and throw it back.",
    view: { scale: 2.3, x: 34, y: 34 },
  },
  {
    num: "II",
    title: "The Setting",
    body: "Each stone is held, not glued. Fine gold-tone claws grip every corner so the stone sits proud and the light can travel beneath it.",
    view: { scale: 2.9, x: 46, y: 56 },
  },
  {
    num: "III",
    title: "The Bead",
    body: "Between settings, a single gold bead. Repeated around the bangle, the beads become the quiet rhythm that gives a VIIRAA stack its finish.",
    view: { scale: 3.1, x: 62, y: 70 },
  },
  {
    num: "IV",
    title: "The Stack",
    body: "One bangle is a line. Six or eight are a sentence. Our sets are composed to be worn together, colour answering colour down the wrist.",
    view: { scale: 1, x: 50, y: 50 },
  },
];

export function CraftStory() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      // On narrow screens the sticky frame covers the top half, so read the band below it.
      { rootMargin: window.matchMedia("(min-width: 1024px)").matches ? "-45% 0px -45% 0px" : "-66% 0px -24% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const v = CHAPTERS[active].view;
  const img = IMG.amethystStyled;

  return (
    <section id="craft" className={styles.section} aria-labelledby="craft-title">
      <div className={`container ${styles.head}`}>
        <p className="eyebrow">The Craft</p>
        <h2 id="craft-title" className="display h-lg">
          Four details, <em>one adornment</em>
        </h2>
      </div>

      <div className={`container ${styles.grid}`}>
        <div className={styles.stickyCol}>
          <div className={styles.frame}>
            <div
              className={styles.camera}
              style={{ "--s": v.scale, "--x": `${v.x}%`, "--y": `${v.y}%` } as CSSProperties}
            >
              <Image
                src={img.src}
                alt="Jamuni amethyst and citrine bangles; the view moves between stone, setting, bead and stack"
                fill
                sizes="(min-width: 1024px) 42vw, 92vw"
                quality={90}
                style={{ objectFit: "cover", objectPosition: "50% 50%" }}
              />
            </div>
            <div className={styles.counter} aria-hidden>
              <span key={active}>{CHAPTERS[active].num}</span>
              <i />
              <span>IV</span>
            </div>
            <div className={styles.progress} aria-hidden>
              {CHAPTERS.map((c, i) => (
                <i key={c.num} className={i <= active ? styles.progOn : ""} />
              ))}
            </div>
          </div>
        </div>

        <ol className={styles.chapters}>
          {CHAPTERS.map((c, i) => (
            <li
              key={c.num}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-index={i}
              className={`${styles.chapter} ${i === active ? styles.chapterOn : ""}`}
            >
              <span className={styles.num}>{c.num}</span>
              <h3 className={styles.title}>{c.title}</h3>
              <p className={styles.body}>{c.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
