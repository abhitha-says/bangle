import { Collections } from "@/components/home/Collections";
import { CraftStory } from "@/components/home/CraftStory";
import { Featured } from "@/components/home/Featured";
import { InstagramGrid } from "@/components/home/InstagramGrid";
import { Marquee } from "@/components/home/Marquee";
import { ShopByColour } from "@/components/home/ShopByColour";
import { Story } from "@/components/story/Story";

/**
 * One continuous story: the campaign film opens into the 3D bangle sequence
 * (src/components/story), which hands over to the collection.
 */
export default function Home() {
  return (
    <>
      <Story />
      <Collections />
      <ShopByColour />
      <Featured />
      <Marquee />
      <CraftStory />
      <InstagramGrid />
    </>
  );
}
