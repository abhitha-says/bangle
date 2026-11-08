import { products } from "@/data/products";
import styles from "./Marquee.module.css";

/** A slow ribbon of piece names: a breath between sections. */
export function Marquee() {
  const names = products.map((p) => p.name);
  const row = (hidden: boolean) => (
    <ul className={styles.row} aria-hidden={hidden || undefined}>
      {names.map((n, i) => (
        <li key={n + i}>
          <span>{n}</span>
          <i aria-hidden />
        </li>
      ))}
    </ul>
  );
  return (
    <div className={styles.marquee} role="presentation">
      <div className={styles.track}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
