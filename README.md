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

## The opening story (homepage)

The homepage opens with one pinned, scroll-driven story. The scroll position is the playhead, so scrolling up plays it backwards exactly.

1. **The film.** Your campaign film plays under the hero copy.
2. **Through the ring.** As you scroll, the camera pulls back through an emerald bangle, and the film is seen through its opening.
3. **The build.** Champagne fills the ring, which lies down. Six more bangles, one from each VIIRAA colourway, drop in and stack. Each landing washes the room in its colour.
4. **The choreography.** The stack floats, separates into a labelled exploded view, orbits on a figure-of-eight against deep wine, reassembles, and comes in close on the stones.
5. **Onto the wrist.** The camera flies down the bore of the stack. The far ring's opening becomes a window onto the girl's wrist (a loop cut from the same film), which opens to full screen. The collection section then rises over it.

The code is in `src/components/story/`:

| File | Role |
| --- | --- |
| `bangles.ts` | The seven bangles. Stone and lacquer colours were sampled from the product photographs. |
| `geometry.ts` | Procedural bangle built to the real construction: lacquered channel, 36 octagon-cut stones, and a gold bead on each edge at every junction. |
| `studio.ts` | Studio environment (softboxes), lights and contact shadow. |
| `timeline.ts` | Scene timings, colour bands and copy. Pure functions of progress, with no three.js. |
| `choreography.ts` | Camera and bangle poses for each scene. Also pure functions of progress. |
| `engine.ts` | The WebGL renderer. It projects the film window and labels back to the page. |
| `Story.tsx` | The pinned stage, film layers, copy, ledger, labels and chapter rail. |
| `StoryStatic.tsx` | A still-photograph version for reduced-motion visitors and devices without WebGL. |

Quality adapts to the device:

- Desktops render glass stones with refraction.
- Phones and weaker GPUs use a lighter faceted material at a lower resolution.
- If frames run slow, the engine steps down by itself.

For testing, `/?quality=low` or `/?quality=high` forces a tier, and `/?instant` turns off scroll smoothing.

The 3D bangles are a faithful *representation* built from the photographs, with the same colours, cut, bead placement and proportions. They are not scans of individual pieces. The product photographs remain the reference everywhere else on the site.

## Hero film

All three files in `public/media/` come from the supplied film `VIRAA-hero-film-1080p-web-loop.mp4`.

| File | Used when |
| --- | --- |
| `hero-1080.mp4` | The original, for large landscape screens |
| `hero-720.mp4` | Smaller landscape screens, or Save-Data and slow connections |
| `hero-portrait.mp4` | Phones and portrait tablets (aspect ratio of 4:5 or narrower) |
| `wrist-1080.mp4`, `wrist-portrait.mp4` | The story's finale: the emerald-wrist shot from the same film, played forward then in reverse so it loops seamlessly |

The portrait cut is a re-framed 810×1080 crop. Each shot is centred on its jewellery, and it pans slowly across the four-stack shot, so phones never get a blind centre crop.

The hero fills `100svh` with `object-fit: cover`. The art-directed poster (`hero-poster*.webp`) paints instantly and is the fallback if autoplay is refused. The film then crossfades in.

Playback rules:

- The film pauses when it is off-screen or the tab is hidden.
- With `prefers-reduced-motion` it does not play.
- A small pause/play control is provided for accessibility (WCAG 2.2.2).

To re-create every variant from the master film and poster, run `scripts/encode_hero.sh`. The shot-by-shot crop positions are documented inside the script.
