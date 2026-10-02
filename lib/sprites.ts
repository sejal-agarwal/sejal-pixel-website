// Sprite sheet metadata for the Little Dreamyland assets we use.
// Frame sizes/counts were measured directly from the PNGs (see the CP2
// checkpoint notes) rather than assumed, since the pack ships without a
// manifest.

export type SpriteSheet = {
  src: string;
  frameW: number;
  frameH: number;
  cols: number;
  rows: number;
};

export type Direction = "up" | "down" | "left" | "right";

// Row order in the bunny sheets, confirmed against the CP2 test grid
// (row 0 is a back view = "up"; rows 1-3 are front-facing poses — row 1
// reads as "right", row 3 as "down", row 2 as "left").
export const directionRow: Record<Direction, number> = {
  up: 0,
  right: 1,
  left: 2,
  down: 3,
};

export const sheets = {
  // Static decorations — each is a single irregular crop taken directly
  // from the pack's tilesets (not grid-aligned, since organic art like
  // trees and rooflines overflows the 16px tile grid). Cropped once into
  // its own trimmed PNG under public/sprites/decor/ rather than teaching
  // <Sprite> to address an arbitrary sub-rect of a shared sheet.
  // A reference house image the user supplied directly (green roof),
  // not cropped from House_Tileset.png. See scripts/generate-house.py
  // and scripts/assets/house-source.png.
  house: { src: "/sprites/decor/house.png", frameW: 84, frameH: 96, cols: 1, rows: 1 },
  bushTree: { src: "/sprites/decor/bush-tree.png", frameW: 30, frameH: 36, cols: 1, rows: 1 },
  pineTree: { src: "/sprites/decor/pine-tree.png", frameW: 22, frameH: 32, cols: 1, rows: 1 },
  rock: { src: "/sprites/decor/rock.png", frameW: 24, frameH: 24, cols: 1, rows: 1 },
  stump: { src: "/sprites/decor/stump.png", frameW: 24, frameH: 26, cols: 1, rows: 1 },
  lamp: { src: "/sprites/decor/lamp.png", frameW: 9, frameH: 18, cols: 1, rows: 1 },
  sign: { src: "/sprites/decor/sign.png", frameW: 14, frameH: 30, cols: 1, rows: 1 },
  // Re-cropped from the pack's Exterior_Tileset — the original crop of
  // this file bundled a couple of stray, unrelated fence fragments from
  // neighboring sheet cells along with the actual corral, and its inner
  // decorative center post has been erased so the pen reads as open.
  fenceCorral: { src: "/sprites/decor/fence-corral.png", frameW: 30, frameH: 40, cols: 1, rows: 1 },
  // Re-cropped from the pack's Tileset_Floor_Detail — the original
  // crops of flower-purple and flower-white each bundled a stray
  // fragment from a neighboring sheet cell.
  flowerPurple: { src: "/sprites/decor/flower-purple.png", frameW: 11, frameH: 12, cols: 1, rows: 1 },
  flowerWhite: { src: "/sprites/decor/flower-white.png", frameW: 12, frameH: 10, cols: 1, rows: 1 },
  grassTuft: { src: "/sprites/decor/grass-tuft.png", frameW: 14, frameH: 11, cols: 1, rows: 1 },
  cropGrown: { src: "/sprites/decor/crop-grown.png", frameW: 9, frameH: 9, cols: 1, rows: 1 },
  // Tileset_Floor_Detail's scatter of small ground specks, for a bit of
  // grass texture.
  groundSpeckle: { src: "/sprites/decor/ground-speckle.png", frameW: 11, frameH: 12, cols: 1, rows: 1 },
  // More Tileset_Floor_Detail pieces, picked via the Yard Decorator
  // artifact tool (see the scatter block in landingMap.ts).
  rockRound: { src: "/sprites/decor/rock-round.png", frameW: 10, frameH: 8, cols: 1, rows: 1 },
  weedClumpLarge: { src: "/sprites/decor/weed-clump-large.png", frameW: 21, frameH: 8, cols: 1, rows: 1 },
  weedClumpMedium: { src: "/sprites/decor/weed-clump-medium.png", frameW: 28, frameH: 13, cols: 1, rows: 1 },
  grassRingA: { src: "/sprites/decor/grass-ring-a.png", frameW: 15, frameH: 13, cols: 1, rows: 1 },
  flowerDotScatter: { src: "/sprites/decor/flower-dot-scatter.png", frameW: 11, frameH: 11, cols: 1, rows: 1 },
  petalScatter: { src: "/sprites/decor/petal-scatter.png", frameW: 11, frameH: 13, cols: 1, rows: 1 },
  dashScatter: { src: "/sprites/decor/dash-scatter.png", frameW: 14, frameH: 12, cols: 1, rows: 1 },
  // Exterior_Tileset's flower planter boxes.
  planterYellow: { src: "/sprites/decor/planter-yellow.png", frameW: 14, frameH: 12, cols: 1, rows: 1 },
  planterBlue: { src: "/sprites/decor/planter-blue.png", frameW: 14, frameH: 12, cols: 1, rows: 1 },
  // Exterior_Tileset's laundry line, with a shirt, shorts and a towel
  // already strung up.
  clothesline: { src: "/sprites/decor/clothesline.png", frameW: 40, frameH: 19, cols: 1, rows: 1 },

  chickenIdle: {
    src: "/sprites/animals/chicken/Chicken_Idle.png",
    frameW: 48,
    frameH: 48,
    cols: 8,
    rows: 4, // row 0 = front-facing idle bob (confirmed visually)
  },
  cowIdle: {
    src: "/sprites/animals/cow/Cow_Idle.png",
    frameW: 48,
    frameH: 48,
    cols: 8,
    rows: 4,
  },

  bunnyIdle: {
    src: "/sprites/characters/bunny/Bunny_Idle.png",
    frameW: 48,
    frameH: 48,
    cols: 5,
    rows: 4,
  },
  bunnyRun: {
    src: "/sprites/characters/bunny/Bunny_Run.png",
    frameW: 48,
    frameH: 48,
    cols: 8,
    rows: 4,
  },
  bunnyWatering: {
    src: "/sprites/characters/bunny/Bunny_WateringCan.png",
    frameW: 48,
    frameH: 48,
    cols: 9,
    rows: 4, // same row order as bunnyIdle — row 3 is front-facing
  },
  campfire: {
    src: "/sprites/objects/Campfire.png",
    frameW: 16,
    frameH: 32,
    cols: 7,
    rows: 1,
  },
  chest: {
    src: "/sprites/objects/Chest.png",
    frameW: 16,
    frameH: 32,
    cols: 7,
    // row 0 = light oak, row 1 = dark walnut. Frames run closed (0-1) ->
    // lid lifting (2-4) -> open (5-6).
    rows: 2,
  },
  autotile: {
    src: "/sprites/tileset/Autotile_Grass_and_Dirt_Path_Tileset.png",
    frameW: 16,
    frameH: 16,
    cols: 21,
    rows: 11,
  },
  // Not part of the original pack — generated to match its palette and
  // border style (see scripts/generate-concave-corners.py) because the
  // source sheet only ships convex corner pieces. Used for the inside
  // corner of a path bend, where a "fill" cell's diagonal neighbor is
  // grass even though all 4 orthogonal neighbors are path. Frame order:
  // NE, NW, SE, SW.
  autotileConcave: {
    src: "/sprites/tileset/Path_Concave_Corners.png",
    frameW: 16,
    frameH: 16,
    cols: 4,
    rows: 1,
  },
} as const satisfies Record<string, SpriteSheet>;

export type SheetName = keyof typeof sheets;
