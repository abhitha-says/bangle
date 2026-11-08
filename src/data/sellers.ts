import type { Seller } from "./types";

/**
 * SELLER CONTACT CONFIGURATION
 * ----------------------------
 * Seller contact is "Coming soon". Until both fields below are filled in, the
 * Instagram and email buttons on every product show a "Coming soon" state.
 *
 * To go live, fill in the real details (never guess them):
 *   instagram: the handle WITHOUT "@", e.g. "viiraa.official"
 *   email:     e.g. "hello@example.com"
 * Each product points at a seller through `sellerId`, so different products
 * can have different sellers. Add more entries here as needed.
 */
export const sellers: Record<string, Seller> = {
  "viiraa-studio": {
    id: "viiraa-studio",
    name: "VIIRAA Studio",
    instagram: "", // TODO: seller Instagram handle (coming soon)
    email: "", // TODO: seller email address (coming soon)
  },
};

export const sellerById = (id: string): Seller | undefined => sellers[id];
