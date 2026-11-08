import { sellerById } from "@/data/sellers";
import type { Product } from "@/data/types";

export interface ContactLinks {
  sellerName: string;
  /** null = not configured yet → UI shows "Coming soon". */
  instagram: string | null;
  email: string | null;
}

const HANDLE = /^[a-z0-9._]{1,30}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function instagramUrl(handle: string): string | null {
  const h = handle.trim().replace(/^@/, "");
  return HANDLE.test(h) ? `https://www.instagram.com/${h}/` : null;
}

export function mailtoUrl(email: string, product?: Pick<Product, "name" | "colour" | "id">): string | null {
  const e = email.trim();
  if (!EMAIL.test(e)) return null;
  if (!product) return `mailto:${e}`;
  const subject = `Enquiry: ${product.name} (${product.colour}), ${product.id}`;
  const body = `Hello,\n\nI'd love to know more about the ${product.name} ${product.colour} bangle set (${product.id}) I saw on VIIRAA, including sizes and availability.\n\nThank you.`;
  return `mailto:${e}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function contactLinksFor(product: Product): ContactLinks {
  const seller = sellerById(product.sellerId);
  return {
    sellerName: seller?.name ?? "VIIRAA",
    instagram: seller?.instagram ? instagramUrl(seller.instagram) : null,
    email: seller?.email ? mailtoUrl(seller.email, product) : null,
  };
}
