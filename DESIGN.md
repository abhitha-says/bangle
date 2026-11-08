# VIIRAA — Design direction

*The Art of Adornment.*

## What the research showed

Sites studied: Cartier, Tiffany & Co., Bvlgari, Mejuri, Monica Vinader, Tanishq, CaratLane, Sabyasachi, Amrapali and Outhouse.

- **Hero.** Bvlgari and Cartier run full-bleed muted video loops. Outhouse and Sabyasachi put a single small tracked caption on the image and nothing else. Nobody puts a filled pill button on the film.
- **Header.** Bvlgari and Mejuri use a transparent sticky header over the hero, with a centred wordmark, menu at left and utilities at right. It turns solid once you scroll.
- **Type.** Pairs are a light serif with tiny uppercase sans labels. Outhouse uses Cormorant with Jost, Tanishq uses Fraunces with Plex, and Tiffany uses Sterling with Santral. Tracking is applied only to uppercase.
- **Colour.** The shell stays neutral (white, stone or ivory) so the jewels carry all the colour. Tanishq's maroon and champagne give the Indian-heritage cue.
- **Listing.** Most grids use flat studio backgrounds, with lifestyle photography as the second image or as an editorial tile inside the grid (Cartier). Mobile grids show image indicators in place of hover.
- **Product page.** The standard is a scrolling image column beside a sticky info column, with accordions and then related pieces.
- **Avoid.** First-paint pop-ups, commerce clutter, bottom tab bars and stock Shopify themes.

## VIIRAA's identity

- **Palette.** Warm ivory `#F7F2EA`, champagne `#EFE6D8` and studio stone `#ECE4D8` make up the shell. Wine `#4A1424` is the single accent, and the footer is a deep oxblood `#22090F`. Muted gold `#A8865A` is used only for hairlines and small ornaments.
- **Type.** Cormorant Garamond, light weight with italics, sets the wordmark, names and editorial voice. Jost sets labels at 11–12px uppercase with 0.2em tracking, plus body text.
- **Motif.** The arch of the jharokha and jaali window seen in the hero film is reused as an image mask for collections and the craft story. It is the one decorative idea, used with restraint.
- **Motion.** Slow, weighted easing `cubic-bezier(.22,.61,.36,1)` and 500–900 ms reveals. Product images crossfade, there is no spin, and `prefers-reduced-motion` is fully honoured.

## Structure

- **`/` (home).**
  1. Full-screen film with a dedicated portrait cut for phones.
  2. A maison statement.
  3. Three collections in arches.
  4. Shop by colour, where the room's light changes with each gem.
  5. The Edit, a set of featured pieces.
  6. The craft story: a sticky macro of the real photograph that pans from stone, to claw, to bead, to stack.
  7. An editorial collage.
  8. An Instagram mosaic.
  9. The footer.
- **`/shop`.** Collection tabs, colour swatches and search are all synced to the URL. The grid has a primary-to-secondary crossfade on hover, swipe with dash indicators on touch, and an editorial tile inside the grid.
- **`/shop/[slug]`.** Gallery, a sticky info column, the contact block (currently "Coming soon"), accordions, related pieces and previous/next navigation.

## Product truth

Product photos are presented exactly as supplied. They are only cropped, scaled uniformly and shown on a background. The jewellery is never recoloured, re-shaped or re-generated. Copy describes only what is visible in the photographs, and sizes and materials are left to the seller.
