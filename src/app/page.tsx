import { Collections } from "@/components/home/Collections";
import { Featured } from "@/components/home/Featured";
import { Hero } from "@/components/home/Hero";
import { InstagramGrid } from "@/components/home/InstagramGrid";
import { Marquee } from "@/components/home/Marquee";
import { ShopByColour } from "@/components/home/ShopByColour";
import styles from "./home.module.css";

export default function Home() {
  return (
    <>
      {/* The film stays pinned while the collection rises over it. */}
      <div className={styles.opening}>
        <div className={styles.heroPin}>
          <Hero />
        </div>
        <Collections />
      </div>
      <ShopByColour />
      <Featured />
      <Marquee />
      <InstagramGrid />
    </>
  );
}
