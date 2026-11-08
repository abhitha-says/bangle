/**
 * The seven bangles of the scroll story: one from each VIIRAA colourway.
 *
 * Construction follows the real pieces (see the studio photographs): a
 * lacquered band in the stone colour carries a single row of octagon
 * (emerald-cut) faceted stones, with a pair of gold beads, one at each edge,
 * at every junction between stones.
 *
 * Stone and lacquer colours were sampled from the supplied photographs
 * (median / light values of the stone pixels), not invented.
 */
export interface StoryBangle {
  /** Piece the bangle comes from (links into the shop). */
  name: string;
  colour: string;
  slug: string;
  /** Stone body colour (sampled, sRGB). */
  stone: string;
  /** Lighter tint of the same stone, used for light passing through. */
  stoneLight: string;
  /** Lacquered band colour. */
  lacquer: string;
  /** Pale wash for the room as this bangle lands. */
  wash: string;
}

/** Bottom of the stack first: this is also the order they arrive in. */
export const STORY_BANGLES: StoryBangle[] = [
  { name: "Panna", colour: "Emerald", slug: "panna-emerald", stone: "#034634", stoneLight: "#138a6a", lacquer: "#0b4a37", wash: "#e3ebe2" },
  { name: "Mehendi", colour: "Olive", slug: "mehendi-olive-green", stone: "#5a5e05", stoneLight: "#909616", lacquer: "#5d611a", wash: "#ebe9d6" },
  { name: "Jamuni", colour: "Citrine", slug: "jamuni-amethyst-citrine", stone: "#8b3c04", stoneLight: "#d4681b", lacquer: "#8a2a5f", wash: "#f3e3d2" },
  { name: "Sindoor", colour: "Ruby", slug: "sindoor-ruby-red", stone: "#9d0312", stoneLight: "#d9192c", lacquer: "#a4101d", wash: "#f4e0dc" },
  { name: "Rani", colour: "Rani Pink", slug: "rani-pink", stone: "#ab0937", stoneLight: "#cb1e50", lacquer: "#a5123f", wash: "#f4dfe5" },
  { name: "Jamuni", colour: "Amethyst", slug: "jamuni-amethyst-citrine", stone: "#500a4b", stoneLight: "#8d1d86", lacquer: "#8a2a7f", wash: "#ece0ec" },
  { name: "Neelam", colour: "Sapphire", slug: "neelam-sapphire-blue", stone: "#051f41", stoneLight: "#123768", lacquer: "#13305c", wash: "#e1e5ee" },
];

/** Antique gold of the bead accents (sampled from the ruby set's beads). */
export const BEAD_GOLD = "#e7b04a";
