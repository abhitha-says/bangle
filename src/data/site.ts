/** Brand-level configuration and copy. */
export const site = {
  name: "VIIRAA",
  tagline: "The Art of Adornment.",
  description:
    "VIIRAA is a showcase of jewel-toned stone bangles: ruby, rani pink, sapphire, emerald and many-hued stacks, finished with gold bead accents. The Art of Adornment.",
  /** Set to the production URL once deployed (used for SEO metadata). */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /**
   * Brand Instagram handle WITHOUT "@". Empty = "Coming soon".
   * TODO: add once the account is ready.
   */
  instagram: "",
  /** Brand enquiries email. Empty = "Coming soon". TODO. */
  email: "",
  hashtag: "#TheArtOfAdornment",
  /** Copyright year (static so pages can be fully prerendered). */
  year: 2026,
} as const;

export const nav = [
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/#collections" },
  { label: "Our Craft", href: "/#craft" },
  { label: "Contact", href: "/contact" },
] as const;
