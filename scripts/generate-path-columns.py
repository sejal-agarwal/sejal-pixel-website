#!/usr/bin/env python3
"""
Generates public/sprites/decor/path-edge-{w,e,n,s}.png — the tiles the
Experience garden's path is built from: edge-w/edge-e tile vertically
(`repeat-y`) for the main trunk (GardenTrack.tsx), and edge-n/edge-s
tile horizontally (`repeat-x`) for the zigzag layout's little branch
paths toward each plot (GardenPlot.tsx's `showSpur`, lg+ only) — same
2-tile thickness as the trunk, just rotated 90°.

Why separate single-tile PNGs rather than addressing
Autotile_Grass_and_Dirt_Path_Tileset.png directly: CSS `repeat-x`/
`repeat-y` tiles whatever image it's given in full, so repeating a
sub-rect of a larger sheet would repeat the whole sheet, not just one
tile. Cropping the tile out to its own file first sidesteps that.

Coordinates are lib/map/autotile.ts's TILES.edgeW/edgeE/edgeN/edgeS
(16px tile grid units) — the only four tiles a straight 2-wide path
ever resolves to, in either orientation.

Run from the repo root: python3 scripts/generate-path-columns.py
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public/sprites/tileset/Autotile_Grass_and_Dirt_Path_Tileset.png"
OUT_DIR = ROOT / "public/sprites/decor"

TILES = {
    "path-edge-w": (15, 2),  # TILES.edgeW
    "path-edge-e": (17, 2),  # TILES.edgeE
    "path-edge-n": (16, 1),  # TILES.edgeN
    "path-edge-s": (16, 3),  # TILES.edgeS
}


def main() -> None:
    img = Image.open(SOURCE).convert("RGBA")
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for name, (col, row) in TILES.items():
        box = (col * 16, row * 16, col * 16 + 16, row * 16 + 16)
        out = OUT_DIR / f"{name}.png"
        img.crop(box).save(out)
        print(f"wrote {out}")


if __name__ == "__main__":
    main()
