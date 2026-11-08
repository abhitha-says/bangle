"""Prepare VIIRAA product images.

Presentation-only processing. The jewellery pixels are never recoloured,
reshaped or retouched:
  * studio shots with a baked-in checkerboard get that neutral background
    keyed out (flood fill from the border over light, unsaturated pixels);
  * existing cutouts have near-opaque alpha (253) snapped to 255;
  * every cutout is placed, uniformly scaled, on a common 3:4 transparent
    canvas so the grid reads at one consistent product scale.
Styled / lifestyle photos are copied with format conversion and, where
needed, a crop (never a stretch).
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

SRC = Path(sys.argv[1])
OUT = Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)

CANVAS = (1200, 1600)  # 3:4
FILL = 0.84            # product height as fraction of canvas height


def key_checkerboard(img: Image.Image) -> Image.Image:
    a = np.asarray(img.convert("RGB")).astype(np.int16)
    mx, mn = a.max(2), a.min(2)
    candidate = ((mx - mn) < 26) & (mn > 196)
    labels, _ = ndimage.label(candidate)
    border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    border = border[border != 0]
    bg = np.isin(labels, border)
    # Close tiny pinholes in the background, keep jewellery untouched.
    bg = ndimage.binary_opening(bg, iterations=1) | (bg & ndimage.binary_erosion(bg, iterations=2))
    alpha = np.where(bg, 0, 255).astype(np.float32)
    # 1px feather so anti-aliased edges sit softly on the ivory card.
    alpha = ndimage.gaussian_filter(alpha, 0.7)
    alpha[~ndimage.binary_dilation(bg, iterations=2)] = 255
    rgba = np.dstack([a.astype(np.uint8), alpha.clip(0, 255).astype(np.uint8)])
    return Image.fromarray(rgba, "RGBA")


def clean_alpha(img: Image.Image) -> Image.Image:
    a = np.asarray(img.convert("RGBA")).copy()
    al = a[..., 3]
    al[al >= 248] = 255
    al[al <= 6] = 0
    a[..., 3] = al
    return Image.fromarray(a, "RGBA")


def drop_specks(img: Image.Image, min_px: int = 400) -> Image.Image:
    """Remove isolated background specks (a few px) left at image borders."""
    a = np.asarray(img).copy()
    solid = a[..., 3] > 24
    labels, n = ndimage.label(solid)
    if n > 1:
        sizes = ndimage.sum(solid, labels, range(1, n + 1))
        small = np.isin(labels, np.where(sizes < min_px)[0] + 1)
        a[small, 3] = 0
    return Image.fromarray(a, "RGBA")


def place_on_canvas(img: Image.Image) -> Image.Image:
    img = drop_specks(img)
    bbox = img.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox()
    crop = img.crop(bbox)
    w, h = crop.size
    scale = min(CANVAS[1] * FILL / h, CANVAS[0] * 0.86 / w)
    crop = crop.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    x = (CANVAS[0] - crop.width) // 2
    y = (CANVAS[1] - crop.height) // 2
    canvas.alpha_composite(crop, (x, y))
    return canvas


CUTOUTS = {
    "ruby-red-studio": ("Ruby Red Gemstone Bangle Stack.png", "checker"),
    "rani-pink-studio": ("Magenta Beaded Gemstone Bangle Stack.png", "checker"),
    "sapphire-blue-studio": ("Navy Blue Sapphire Bangle Stack.png", "checker"),
    "amethyst-citrine-studio": ("Amethyst and Citrine Gemstone Bangle Stack.png", "alpha"),
    "olive-green-studio": ("Olive Green Faceted Bangle Stack.png", "alpha"),
    "jewel-gradient-studio": ("Gradient Jewel-Tone Bangle Stack.png", "alpha"),
    "rainbow-studio": ("Rainbow Jeweled Gold Bangles.png", "alpha"),
}

for name, (file, mode) in CUTOUTS.items():
    img = Image.open(SRC / file)
    img = key_checkerboard(img) if mode == "checker" else clean_alpha(img)
    place_on_canvas(img).save(OUT / f"{name}.png", optimize=True)
    print("cutout", name)

# Styled & lifestyle photographs: convert, crop only where required.
STYLED = {
    "ruby-red-styled": ("Luxurious Red Gemstone Bangle Stack.png", None),
    "amethyst-citrine-styled": ("Amethyst and Amber Bangle Still Life.png", None),
    "emerald-silk": ("Emerald Bangles on Gold-Embroidered Silk.png", None),
    # Crop away the baked-in "VIRAA" lettering on the right-hand panel.
    "emerald-lifestyle": ("Emerald Bangles_ The Art of Adornment.png", (0, 0, 820, 1316)),
    "quartet-silk": ("Jeweled Bangle Quartet on Golden Silk.png", None),
    "plum-amber-wrist": ("Regal Plum and Amber Bangles.png", None),
    "purple-saree-portrait": ("Warm Purple Saree Portrait.png", None),
}
for name, (file, box) in STYLED.items():
    img = Image.open(SRC / file).convert("RGB")
    if box:
        img = img.crop(box)
    img.save(OUT / f"{name}.jpg", quality=92, optimize=True, progressive=True)
    print("styled", name, img.size)
