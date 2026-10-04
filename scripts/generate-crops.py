#!/usr/bin/env python3
"""
Generates public/sprites/decor/crop-<kind>-<stage>.png and
public/sprites/decor/well.png — the Experience section's garden plots.

Why: Crops_Tileset.png packs its sprites at irregular, non-grid-aligned
positions (confirmed via connected-component bounding boxes, same
situation as the decor crops noted in lib/sprites.ts), so each one is
cropped individually into its own trimmed PNG rather than addressed as
a sub-rect of a shared sheet.

Growth stages per crop (0 = just planted -> 5 = fully ripe) are taken
from 5 of the tileset's 6 stage rows (the seed-packet icon row and the
three decorative flower-topped variants are skipped — see CP notes).

Run from the repo root: python3 scripts/generate-crops.py
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "Little Dreamyland - Free Pack/Tileset/Crops_Tileset.png"
OUT_DIR = ROOT / "public/sprites/decor"

# Column order left-to-right in the sheet.
CROPS = ["carrot", "cabbage", "pumpkin", "strawberry"]

# (x0, x1) per crop column, and (y0, y1) per growth-stage row — measured
# via connected-component bounding boxes, then padded by 1px so no
# antialiased edge pixel gets clipped.
COLS = {
    "carrot": (16, 31),
    "cabbage": (32, 47),
    "pumpkin": (48, 63),
    "strawberry": (64, 79),
}

# Stage 0 (seed) through stage 5 (ripe, harvest-ready single veggie).
ROWS = [
    (35, 46),   # 0: just-planted seed
    (66, 75),   # 1: two-leaf sprout
    (96, 107),  # 2: small leafy growth
    (125, 141), # 3: medium growth
    (156, 173), # 4: large pre-harvest growth
    (208, 224), # 5: fully ripe, ready to harvest
]

def crop_and_save(img: Image.Image, box: tuple[int, int, int, int], out: Path) -> None:
    region = img.crop(box)
    bbox = region.getbbox()
    if bbox:
        region = region.crop(bbox)
    out.parent.mkdir(parents=True, exist_ok=True)
    region.save(out)
    print(f"wrote {out} ({region.width}x{region.height})")


def main() -> None:
    img = Image.open(SOURCE).convert("RGBA")

    for crop in CROPS:
        x0, x1 = COLS[crop]
        for stage, (y0, y1) in enumerate(ROWS):
            crop_and_save(img, (x0, y0, x1, y1), OUT_DIR / f"crop-{crop}-{stage}.png")

    # The stone well/trough — a centerpiece for the garden.
    crop_and_save(img, (48, 415, 81, 448), OUT_DIR / "well.png")


if __name__ == "__main__":
    main()
