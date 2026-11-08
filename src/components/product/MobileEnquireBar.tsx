"use client";

import { useEffect, useState } from "react";
import styles from "./MobileEnquireBar.module.css";

/** Phones: a slim bar that brings the contact options within reach. */
export function MobileEnquireBar({ name, colour, live }: { name: string; colour: string; live: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const target = document.getElementById("enquire");
    if (!target) return;
    let pastTop = false;
    let targetVisible = false;
    const sync = () => {
      const on = pastTop && !targetVisible;
      setShow(on);
      document.documentElement.style.setProperty("--btt-offset", on && window.innerWidth < 1024 ? "72px" : "0px");
    };
    const io = new IntersectionObserver(([e]) => {
      targetVisible = e.isIntersecting || e.boundingClientRect.top < 0;
      sync();
    });
    io.observe(target);
    const onScroll = () => {
      const next = window.scrollY > window.innerHeight * 0.5;
      if (next !== pastTop) {
        pastTop = next;
        sync();
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.documentElement.style.removeProperty("--btt-offset");
    };
  }, []);

  return (
    <div className={`${styles.bar} ${show ? styles.show : ""}`} aria-hidden={!show} inert={!show}>
      <div className={styles.text}>
        <span className={styles.name}>{name}</span>
        <span className={styles.colour}>{colour}</span>
      </div>
      <a href="#enquire" className="btn btn--solid">
        {live ? "Contact seller" : "Enquire · Soon"}
      </a>
    </div>
  );
}
