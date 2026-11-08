import type { ProductImage } from "./types";

/**
 * Every photograph used on the site, defined once.
 * Cutouts were placed on a uniform 1200×1600 canvas (scaled, never
 * distorted) by `scripts/process_products.py`.
 */
const P = "/images/products";

const cutout = (file: string, alt: string): ProductImage => ({
  src: `${P}/${file}.png`,
  alt,
  width: 1200,
  height: 1600,
  kind: "cutout",
  label: "Full set",
});

export const IMG = {
  rubyStudio: cutout("ruby-red-studio", "Sindoor: a stack of six ruby-red stone bangles with gold bead accents"),
  raniStudio: cutout("rani-pink-studio", "Rani: a stack of six rani-pink stone bangles with gold bead accents"),
  sapphireStudio: cutout("sapphire-blue-studio", "Neelam: a stack of six sapphire-blue stone bangles with gold bead accents"),
  oliveStudio: cutout("olive-green-studio", "Mehendi: a stack of six olive-green stone bangles with gold bead accents"),
  amethystStudio: cutout("amethyst-citrine-studio", "Jamuni: a stack of eight alternating amethyst-purple and citrine-amber stone bangles"),
  gradientStudio: cutout("jewel-gradient-studio", "Phulkari: six bangles of stones shading from teal and green to yellow, amber and pink"),
  rainbowStudio: cutout("rainbow-studio", "Indradhanush: seven bangles of stones shading through amber, lime, rose and green"),

  rubyStyled: {
    src: `${P}/ruby-red-styled.jpg`,
    alt: "Sindoor ruby-red bangles standing on golden silk beside red berries",
    width: 1086,
    height: 1448,
    kind: "photo",
    focus: "55% 50%",
    label: "Styled",
  },
  amethystStyled: {
    src: `${P}/amethyst-citrine-styled.jpg`,
    alt: "Jamuni amethyst and citrine bangles on champagne silk with lilac blossoms",
    width: 1086,
    height: 1448,
    kind: "photo",
    focus: "55% 50%",
    label: "Styled",
  },
  emeraldSilk: {
    src: `${P}/emerald-silk.jpg`,
    alt: "Panna emerald-green bangles worn on the wrist against gold-embroidered silk",
    width: 1254,
    height: 1254,
    kind: "photo",
    focus: "58% 50%",
    label: "On the wrist",
  },
  emeraldLifestyle: {
    src: `${P}/emerald-lifestyle.jpg`,
    alt: "A woman in an ivory embroidered kurta wearing Panna emerald bangles on both wrists",
    width: 820,
    height: 1316,
    kind: "photo",
    focus: "50% 40%",
    label: "Styled",
  },
  gradientStyled: {
    src: `${P}/jewel-gradient-styled.jpg`,
    alt: "Phulkari: six jewel-tone bangles shading from teal to rose, standing on golden satin with baby's breath",
    width: 1086,
    height: 1448,
    kind: "photo",
    focus: "50% 50%",
    label: "Styled",
  },
  quartet: {
    src: `${P}/quartet-silk.jpg`,
    alt: "Four VIIRAA bangle stacks in ruby, amethyst and amber, sapphire, and peridot green on golden silk with rose petals",
    width: 1112,
    height: 1415,
    kind: "photo",
    focus: "50% 50%",
  },
  plumWrist: {
    src: `${P}/plum-amber-wrist.jpg`,
    alt: "Plum, amber and smoky stone bangles stacked on a wrist against a plum zari kurta",
    width: 1195,
    height: 1316,
    kind: "photo",
    focus: "45% 45%",
  },
  purplePortrait: {
    src: `${P}/purple-saree-portrait.jpg`,
    alt: "A smiling woman in a plum saree resting her chin on a hand stacked with pink and amber bangles",
    width: 1086,
    height: 1448,
    kind: "photo",
    focus: "50% 35%",
  },
} satisfies Record<string, ProductImage>;

/** A frame from the hero film, used for social sharing. */
export const HERO_POSTER = {
  src: "/media/hero-poster.jpg",
  width: 1920,
  height: 1080,
};
