/**
 * VIIRAA catalogue types.
 *
 * Product data lives in `src/data/*` and is never hard-coded in components.
 * To add a new bangle: drop its photos in `public/images/products/`, add a
 * `Product` entry in `products.ts`, and (optionally) a new collection or
 * colour in `collections.ts` / `colours.ts`.
 */

export type ImageKind =
  /** Isolated product on a transparent background, shown on the studio card. */
  | "cutout"
  /** Styled still life or on-wrist photograph, shown full-bleed. */
  | "photo";

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  kind: ImageKind;
  /** CSS object-position used when the photo is cropped to a frame. */
  focus?: string;
  /** Short label used in the product gallery ("Full set", "Styled"…). */
  label?: string;
}

export type ColourId = "red" | "pink" | "blue" | "green" | "purple" | "multi";

export interface Colour {
  id: ColourId;
  name: string;
  /** Hindi name used as an editorial accent. */
  hindi: string;
  /** Swatch colour for UI dots (CSS colour or gradient). */
  swatch: string;
  /** Very light wash used for the "room light" in Shop by Colour. */
  wash: string;
}

export interface Collection {
  id: string;
  name: string;
  meaning: string;
  description: string;
  cover: ProductImage;
}

export interface Seller {
  id: string;
  name: string;
  /** Instagram handle WITHOUT the @. Empty string = not configured yet. */
  instagram: string;
  /** Seller email. Empty string = not configured yet. */
  email: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** Descriptive colour line, e.g. "Ruby Red". */
  colour: string;
  colourId: ColourId;
  /** Secondary colour family the piece should also appear under. */
  alsoColourIds?: ColourId[];
  category: string;
  collectionId: string;
  /** One line for product cards. */
  shortDescription: string;
  /** Editorial paragraph(s) for the product page. */
  description: string[];
  /** Facts visible in the photographs only. */
  details: string[];
  images: {
    primary: ProductImage;
    secondary?: ProductImage;
    /** Extra gallery views, product page only. */
    gallery?: ProductImage[];
  };
  sellerId: string;
  /** Extra words that should match search (Hindi names, synonyms). */
  keywords?: string[];
  featured?: boolean;
}
