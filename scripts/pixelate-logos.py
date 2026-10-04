#!/usr/bin/env python3
"""
Generates public/sprites/logos/<role-id>.png — small pixel-art company
logos for the Experience garden's signs (see Role.logo in
content/site.ts and CompanyLogo.tsx, which falls back to the company's
first letter until a given id's logo exists here).

Drop a source image (any size, ideally square, transparent background
preferred) at scripts/assets/logos/<role-id>.png for each role id in
content/site.ts's `experience` array, then run this from the repo root:

    python3 scripts/pixelate-logos.py

Each source is downscaled with nearest-neighbor to TARGET_SIZE so it
reads as a pixel-art sprite rather than a blurry shrunk photo — same
approach as scripts/generate-house.py, just resizing down instead of
trimming a known-clean source.
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "scripts/assets/logos"
OUT_DIR = ROOT / "public/sprites/logos"

TARGET_SIZE = 32


def main() -> None:
    if not SOURCE_DIR.exists():
        print(f"no source logos found at {SOURCE_DIR} — nothing to do")
        return

    sources = sorted(SOURCE_DIR.glob("*.png"))
    if not sources:
        print(f"{SOURCE_DIR} is empty — drop a <role-id>.png per role in content/site.ts")
        return

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for source in sources:
        img = Image.open(source).convert("RGBA")
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)

        # Downscale first with a smooth filter to reduce aliasing, then
        # do the final step to TARGET_SIZE with NEAREST so the result
        # has crisp, flat pixel blocks instead of a blurry gradient.
        intermediate = max(TARGET_SIZE * 2, max(img.size))
        if max(img.size) > intermediate:
            scale = intermediate / max(img.size)
            img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)

        scale = TARGET_SIZE / max(img.size)
        final = img.resize((round(img.width * scale), round(img.height * scale)), Image.NEAREST)

        out = OUT_DIR / source.name
        final.save(out)
        print(f"wrote {out} ({final.width}x{final.height})")


if __name__ == "__main__":
    main()
