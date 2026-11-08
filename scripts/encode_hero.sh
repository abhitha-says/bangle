#!/usr/bin/env bash
# Re-create the VIIRAA hero film variants from the supplied master.
# Usage: scripts/encode_hero.sh "<master.mp4>" "<poster.jpg>" viiraa/public/media
set -euo pipefail
IN="$1"; POSTER="$2"; OUT="$3"
mkdir -p "$OUT"

# Portrait 810x1080: per-shot crop x (px from left of the 1920 frame).
#  0–3.5s  jaali portrait  -> 560 (bangles + profile)
#  3.5–6.45s emerald wrist -> 560
#  6.45–10.45s four stacks -> smoothstep pan 0 -> 1110
#  10.45–13.6s plum wrist  -> 400, then ease back to 560 for a seamless loop
X="if(lt(t,3.5),560,if(lt(t,6.45),560,if(lt(t,10.45),1110*(min(1,(t-6.45)/4)*min(1,(t-6.45)/4)*(3-2*min(1,(t-6.45)/4))),if(lt(t,13.6),400,400+160*min(1,(t-13.6)/0.4)))))"
ffmpeg -v error -y -i "$IN" -vf "crop=810:1080:'$X':0,format=yuv420p" \
  -c:v libx264 -preset slow -crf 25 -profile:v high -g 60 -movflags +faststart -an "$OUT/hero-portrait.mp4"

ffmpeg -v error -y -i "$IN" -vf "scale=1280:720:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -crf 26 -profile:v high -g 60 -movflags +faststart -an "$OUT/hero-720.mp4"

cp "$IN" "$OUT/hero-1080.mp4"

python3 - "$POSTER" "$OUT" <<'EOF'
import sys
from PIL import Image
pos, o = sys.argv[1], sys.argv[2]
im = Image.open(pos).convert("RGB")
im.save(o + "/hero-poster.jpg", quality=82, optimize=True, progressive=True)
im.save(o + "/hero-poster.webp", quality=78)
im.resize((1280, 720), Image.LANCZOS).save(o + "/hero-poster-720.webp", quality=78)
p = im.crop((400, 0, 1210, 1080))
p.save(o + "/hero-poster-portrait.jpg", quality=82, optimize=True, progressive=True)
p.save(o + "/hero-poster-portrait.webp", quality=78)
EOF
echo "done"
