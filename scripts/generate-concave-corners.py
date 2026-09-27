#!/usr/bin/env python3
"""
Generates public/sprites/tileset/Path_Concave_Corners.png — 4 concave
corner tiles (NE, NW, SE, SW) that match the palette and border style of
Autotile_Grass_and_Dirt_Path_Tileset.png.

Why: that sheet only ships convex corner pieces (a rounded-corner square
bed), so a path tile whose 4 orthogonal neighbours are all path but whose
diagonal neighbour is grass (the inside of a bend) has nothing to render
but a plain dirt "fill" tile — which reads as a flat, textureless corner.
This script paints a small quarter-circle grass notch, anchored at each
tile corner, using colors sampled directly from the source sheet's own
corner tiles (see CP3 checkpoint notes for the sampling).

Run from the repo root: python3 scripts/generate-concave-corners.py
"""

import math
from pathlib import Path

from PIL import Image

GRASS = (175, 194, 89)
GRASS_MID = (116, 149, 62)
GRASS_DARK = (36, 88, 36)
DIRT_SHADOW = (190, 119, 90)
DIRT = (219, 156, 116)

SIZE = 16
RADIUS = 5  # notch radius in px, anchored at the tile corner — kept small
# and smooth (no jagged noise) after a first version was too big and too
# spiky next to the reference's small, cleanly-rounded corners
OUTLINE = 0.8  # dark-outline band thickness
MID = 1.6  # mid-tone band thickness (measured inward from RADIUS)

CORNERS = ["NE", "NW", "SE", "SW"]  # sheet column order


def make_notch(corner: str) -> Image.Image:
    cx = SIZE - 0.5 if "E" in corner else -0.5
    cy = SIZE - 0.5 if "S" in corner else -0.5
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    px = img.load()
    for y in range(SIZE):
        for x in range(SIZE):
            d = math.hypot(x - cx, y - cy)
            if d < RADIUS - MID:
                px[x, y] = (*GRASS, 255)
            elif d < RADIUS - OUTLINE:
                px[x, y] = (*GRASS_MID, 255)
            elif d < RADIUS:
                px[x, y] = (*GRASS_DARK, 255)
            elif d < RADIUS + OUTLINE:
                px[x, y] = (*DIRT_SHADOW, 255)
            else:
                px[x, y] = (*DIRT, 255)
    return img


def main() -> None:
    sheet = Image.new("RGBA", (SIZE * len(CORNERS), SIZE), (0, 0, 0, 0))
    for i, corner in enumerate(CORNERS):
        sheet.paste(make_notch(corner), (i * SIZE, 0))

    out = Path(__file__).resolve().parent.parent / "public/sprites/tileset/Path_Concave_Corners.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out)
    print(f"saved {out} ({sheet.size[0]}x{sheet.size[1]})")


if __name__ == "__main__":
    main()
