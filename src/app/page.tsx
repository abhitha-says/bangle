import { Collections } from "@/components/home/Collections";
import { CraftStory } from "@/components/home/CraftStory";
import { Editorial } from "@/components/home/Editorial";
import { Featured } from "@/components/home/Featured";
import { Hero } from "@/components/home/Hero";
import { InstagramGrid } from "@/components/home/InstagramGrid";
import { Intro } from "@/components/home/Intro";
import { Marquee } from "@/components/home/Marquee";
import { ShopByColour } from "@/components/home/ShopByColour";

export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <Collections />
      <ShopByColour />
      <Featured />
      <Marquee />
      <CraftStory />
      <Editorial />
      <InstagramGrid />
    </>
  );
}
