import { collectionById, collections } from "@/data/collections";
import { colours } from "@/data/colours";
import { products } from "@/data/products";
import type { ColourId, Product } from "@/data/types";

export { collections, colours, products };

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const productColourIds = (p: Product): ColourId[] => [p.colourId, ...(p.alsoColourIds ?? [])];

export const featuredProducts = () => products.filter((p) => p.featured);

export const productsInCollection = (id: string) => products.filter((p) => p.collectionId === id);

export const collectionName = (p: Product) => collectionById(p.collectionId)?.name ?? "";

/** Same collection first, then same colour family, then the rest. */
export function relatedProducts(product: Product, limit = 4): Product[] {
  const others = products.filter((p) => p.id !== product.id);
  const score = (p: Product) =>
    (p.collectionId === product.collectionId ? 2 : 0) +
    (productColourIds(p).some((c) => productColourIds(product).includes(c)) ? 1 : 0);
  return others
    .map((p, i) => ({ p, s: score(p), i }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, limit)
    .map((x) => x.p);
}

export function adjacentProducts(product: Product) {
  const i = products.findIndex((p) => p.id === product.id);
  return {
    prev: products[(i - 1 + products.length) % products.length],
    next: products[(i + 1) % products.length],
  };
}

const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");

/**
 * Every term must match somewhere in the product's searchable text. Results
 * are ranked: name and colour matches first, then keywords, then copy.
 */
export function searchProducts(query: string, list: Product[] = products): Product[] {
  const terms = normalise(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return list;
  const scored = list.map((p, i) => {
    const strong = normalise(`${p.name} ${p.colour}`);
    const medium = normalise([collectionName(p), ...(p.keywords ?? [])].join(" "));
    const hay = normalise(
      [
        strong,
        medium,
        p.category,
        p.shortDescription,
        ...p.description,
        ...productColourIds(p).map((id) => colours.find((c) => c.id === id)?.name ?? ""),
      ].join(" "),
    );
    if (!terms.every((t) => hay.includes(t))) return null;
    const score = terms.reduce((n, t) => n + (strong.includes(t) ? 3 : medium.includes(t) ? 2 : 1), 0);
    return { p, score, i };
  });
  return scored
    .filter((x): x is { p: Product; score: number; i: number } => x !== null)
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map((x) => x.p);
}

export interface ShopFilters {
  collection?: string | null;
  colour?: string | null;
  q?: string | null;
}

export function filterProducts({ collection, colour, q }: ShopFilters): Product[] {
  let list = products;
  if (collection) list = list.filter((p) => p.collectionId === collection);
  if (colour) list = list.filter((p) => productColourIds(p).includes(colour as ColourId));
  if (q) list = searchProducts(q, list);
  return list;
}
