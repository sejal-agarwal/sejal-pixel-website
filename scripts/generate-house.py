#!/usr/bin/env python3
"""
Generates public/sprites/decor/house.png — the cottage at the top of the
landing path.

Why: this is a reference house image the user supplied directly
(scripts/assets/house-source.png), not cropped from House_Tileset.png.
It's already a clean transparent PNG, so this script just trims it to
its content bounding box and downscales with nearest-neighbor to a
sprite-appropriate size (which keeps edges crisp since the source art
is already pixel-style).

Run from the repo root: python3 scripts/generate-house.py
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "scripts/assets/house-source.png"
OUT = ROOT / "public/sprites/decor/house.png"

TARGET_WIDTH = 84


def main() -> None:
    img = Image.open(SOURCE).convert("RGBA")
    img = img.crop(img.getbbox())

    target_h = round(img.height * TARGET_WIDTH / img.width)
    sprite = img.resize((TARGET_WIDTH, target_h), Image.NEAREST)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    sprite.save(OUT)
    print(f"wrote {OUT} ({sprite.width}x{sprite.height})")


if __name__ == "__main__":
    main()
