Drop one source logo per role here, named `<role-id>.png` (the `id`
field from each entry in `content/site.ts`'s `experience` array — e.g.
`autodesk.png`, `outschool.png`, `highway-three.png`).

Then run from the repo root:

    python3 scripts/pixelate-logos.py

This downscales each into public/sprites/logos/ as a small pixel-art
sprite. Until a role's logo exists there, its sign on the Experience
page falls back to the company's first letter (see CompanyLogo.tsx).
