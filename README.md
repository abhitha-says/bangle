# VIIRAA — The Art of Adornment

VIIRAA is a showcase website for jewel-toned stone bangles. It is built with Next.js 16 (App Router, Cache Components), React 19 and plain CSS Modules, and uses Motion only for the shop filter transitions.

It has no cart, checkout or payments. Every piece shows **Contact on Instagram** and **Email Seller**. Both currently read **Coming soon**.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Set `NEXT_PUBLIC_SITE_URL` to the production URL before deploying. It is used for canonical URLs, the sitemap and social cards.

## Where things live

| What | File |
| --- | --- |
| Products (names, copy, images, seller) | `src/data/products.ts` |
| Every photograph (alt text, crop focus) | `src/data/images.ts` |
| Collections | `src/data/collections.ts` |
| Colours (filters and swatches) | `src/data/colours.ts` |
| **Seller contact (Instagram and email)** | `src/data/sellers.ts` |
| Brand Instagram and email, tagline | `src/data/site.ts` |
| Catalogue queries (search, filters, related) | `src/lib/catalog.ts` |
| Contact link builders (Instagram URL, mailto) | `src/lib/contact.ts` |
| Design tokens and shared styles | `src/app/globals.css` |
| Design direction and research | `DESIGN.md` |

## Turning seller contact on

Open `src/data/sellers.ts` and fill in the real details:

```ts
"viiraa-studio": {
  id: "viiraa-studio",
  name: "VIIRAA Studio",
  instagram: "your.handle",      // without @
  email: "hello@yourdomain.com",
},
```

The buttons go live automatically.

- **Instagram** opens the profile in a new tab.
- **Email** opens the visitor's mail app. The subject is filled in, for example "Enquiry: Sindoor (Ruby Red), VR-001", and so is a short message.

Different products can point to different sellers through `sellerId`. The footer, the contact page and the Instagram section read the brand-level `site.instagram` and `site.email` in `src/data/site.ts`.

## Adding a bangle

1. Put the photos in `public/images/products/`. An isolated photo with a transparent background is best for the grid. A styled or on-wrist photo works well as the second, hover image.
2. Register the photos in `src/data/images.ts`. A cutout is placed on the studio card, and a photo is cropped with `object-fit: cover` using its `focus` point.
3. Add a `Product` to `src/data/products.ts`.

The shop, filters, search, product page, sitemap and related pieces all pick it up automatically.

If a product has only one photo, the card zooms in gently with a light tilt on hover rather than crossfading. A second angle is never invented.

## Product photo rules

`scripts/process_products.py` prepared the supplied photographs. It only does presentation work:

- It removes the checkerboard background that was baked into three studio shots.
- It snaps near-opaque alpha to fully opaque.
- It scales each cutout uniformly onto a common 3:4 canvas.
- It crops the "VIRAA" lettering (spelled with one I) out of one campaign photo.

Stones, colours, bead placement and proportions are untouched. On the site, the "Detail" view in the product gallery is a CSS zoom of the same photograph.

## Hero film

All three files in `public/media/` come from the supplied film `VIRAA-hero-film-1080p-web-loop.mp4`.

| File | Used when |
| --- | --- |
| `hero-1080.mp4` | The original, for large landscape screens |
| `hero-720.mp4` | Smaller landscape screens, or Save-Data and slow connections |
| `hero-portrait.mp4` | Phones and portrait tablets (aspect ratio of 4:5 or narrower) |

The portrait cut is a re-framed 810×1080 crop. Each shot is centred on its jewellery, and it pans slowly across the four-stack shot, so phones never get a blind centre crop.

The hero fills `100svh` with `object-fit: cover`. The art-directed poster (`hero-poster*.webp`) paints instantly and is the fallback if autoplay is refused. The film then crossfades in.

Playback rules:

- The film pauses when it is off-screen or the tab is hidden.
- With `prefers-reduced-motion` it does not play.
- A small pause/play control is provided for accessibility (WCAG 2.2.2).

To re-create every variant from the master film and poster, run `scripts/encode_hero.sh`. The shot-by-shot crop positions are documented inside the script.
