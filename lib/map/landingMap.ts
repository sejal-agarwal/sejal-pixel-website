// The landing scene's layout: the dirt path (authored as a filled region,
// not a thin line — see the autotile notes for why) plus every decoration
// placed on top of it. Positions are in 16px tile units (TILE in
// LandingScene.tsx), fractional where it helps fine placement, since
// decorations are organic art that doesn't sit on the tile grid the way
// the path does.
//
// The house sits at the top of the path, centered over it; the bunny
// stands in front on the grass, with a clothesline and a fenced cow pen
// filling out the yard on desktop. The campfire, lamps and chest are
// still pulled out for now — the mobile layout in particular stays
// deliberately sparse (just the house and one tree) since there's no
// room to spread decor sideways there the way desktop can.

import { sheets, type SheetName } from "@/lib/sprites";

export type TileCoord = [col: number, row: number];

/** An axis-aligned box in tile units, used for bunny collision. */
export type Rect = { x0: number; y0: number; x1: number; y1: number };

export type PathGrid = {
  /** Tile columns the centered scene canvas spans (for width/centering). */
  cols: number;
  /** Tile rows actually visible before the container clips the rest. */
  visibleRows: number;
};

function rect(col0: number, row0: number, w: number, h: number): TileCoord[] {
  const cells: TileCoord[] = [];
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      cells.push([col0 + c, row0 + r]);
    }
  }
  return cells;
}

// Desktop
// centerCol + 1 (the path's own center, since it's 2 tiles wide starting
// at centerCol) must equal cols / 2 for the path to land in the middle of
// the canvas the section centers on the page — see LandingScene.
const desktopCenterCol = 8;
export const desktopPath: TileCoord[] = rect(desktopCenterCol, 2, 2, 10); // last 2 rows clipped
export const desktopGrid: PathGrid = { cols: 18, visibleRows: 15 };

// Mobile (really: everything under the 840px breakpoint — see the
// className split in LandingScene — so phones and small/narrow tablets.
// Above 840px the scene shows a side-by-side billboard+house instead,
// shedding the tree then the clothesline/corral as it narrows (see
// tabletWideDecor/tabletNarrowDecor below) rather than jumping straight
// to this stacked layout; 840px is where even that pared-down,
// house-plus-billboard-only composition stops fitting — see
// tabletNarrowGrid's doc.)
// mobilePath is defined further down, near mobileDecor — unlike the
// other tiers' paths, it has to be positioned relative to mobileHouseY
// (itself computed below), not just mobileCenterCol, so it actually
// lines up with the shrunk house's door instead of the fixed row range
// the other grids use.
const mobileCenterCol = 3;
// Shorter than the other grids' 15 — this one doesn't share visibleRows
// with them (see LandingScene's responsive --scene-rows, set in
// globals.css), since the stacked layout's content is genuinely shorter
// once the house is scaled down (see mobileHouseScale below): billboard
// to the last flower bottoms out around row 11-12. Retune together with
// mobileHouseScale/mobileHouseY if the stack's content changes.
export const mobileGrid: PathGrid = { cols: 8, visibleRows: 13 };

export type DecorItem = {
  sheet: string;
  /** Top-left position, in tile units. */
  x: number;
  y: number;
  /**
   * Paint-order override for items that must sit in front of something
   * they'd otherwise sort behind by y alone (e.g. the cow needs to sit
   * in front of its corral even after the corral is nudged below it —
   * see the depth-sort note in LandingScene.tsx). Higher paints later
   * (on top). Defaults to 0; leave unset unless you have this problem.
   */
  z?: number;
  row?: number;
  /** Cycle through several rows in sequence — see AnimatedSprite's `rows`. */
  rows?: number[];
  animated?: boolean;
  fps?: number;
  frameCount?: number;
  alt?: string;
  /** Use smooth (not pixelated) scaling — for photo-derived sprites. */
  smooth?: boolean;
  /**
   * Shrinks the sprite in place (CSS transform, not a different tile
   * size), anchored to its top-center so `x`/`y` still mark where its
   * top edge and horizontal center land — see DecorSprite. Leave unset
   * for native size.
   */
  scale?: number;
};

// Sheets solid enough that the bunny shouldn't be able to walk through
// them when driven by scroll/arrow keys — the small ground-texture
// scatter (loose flowers, grass tufts, speckles) stays walkable, but the
// planter boxes are raised wooden crates, not flat ground cover.
const collidableSheets = new Set<SheetName>([
  "house",
  "bushTree",
  "pineTree",
  "rock",
  "stump",
  "fenceCorral",
  "planterYellow",
  "planterBlue",
  "clothesline",
  "lamp",
  "sign",
]);

/** Obstacle boxes for every collidable decor item, in tile units. */
function decorObstacles(decor: DecorItem[]): Rect[] {
  return decor
    .filter((item) => collidableSheets.has(item.sheet as SheetName))
    .map((item) => {
      const sheet = sheets[item.sheet as SheetName];
      const w = (sheet.frameW / 16) * (item.scale ?? 1);
      const h = (sheet.frameH / 16) * (item.scale ?? 1);
      return { x0: item.x, y0: item.y, x1: item.x + w, y1: item.y + h };
    });
}

/**
 * All obstacle boxes for a scene tier — the collidable decor plus the
 * billboard itself (not a DecorItem, so it's boxed separately using its
 * own x/y/width/height). Used by BunnyRoutine to keep arrow-key/scroll
 * movement from walking through solid scenery.
 */
export function sceneObstacles(
  decor: DecorItem[],
  billboard: { x: number; y: number; width: number; height: number },
): Rect[] {
  return [
    ...decorObstacles(decor),
    { x0: billboard.x, y0: billboard.y, x1: billboard.x + billboard.width, y1: billboard.y + billboard.height },
  ];
}

// House sprite is 84x96px (5.25 x 6 tiles); centered over the
// 2-tile-wide path with its base a little past the path's start row.
const houseW = 84 / 16;
const houseH = 96 / 16;
// Planter sprites (planterYellow/planterBlue) are both 14x12px — used by
// mobileDecor below to convert the desktop planters' left-edge x's into
// center offsets (see its comment there).
const planterW = 14 / 16;

// Dropped a tile below the canvas top so the roof clears the sticky
// navbar instead of touching it. Everything else that's positioned
// relative to the house (bunny, trees, billboard) carries this down too.
const houseY = 1;

// The cow pen, up near the top of the yard, and the cow's own position
// within it — kept as separate constants (rather than the cow being an
// offset off the pen's y) so the two can be nudged independently.
const corralY = houseY + houseH - 19 / 16 - 3.425;
const cowY = houseY + houseH - 19 / 16 - 3.625;

export const desktopDecor: DecorItem[] = [
  {
    sheet: "house",
    x: desktopCenterCol + 1 - houseW / 2,
    y: houseY,
    alt: "A small cottage at the top of the path",
  },
  // The bunny itself is the BunnyRoutine component (see LandingScene.tsx)
  // rather than a static DecorItem — desktop-only, it walks between
  // bunnyHome below and bunnyBillboardStop, so it needs to update its
  // own position over time, not just its animation frame.

  // A rounded tree on the right, pushed out past the clothesline and
  // corral so it doesn't crowd them.
  { sheet: "bushTree", x: desktopCenterCol + 7.2, y: houseY + 3 },

  // The clothesline, right beside the house — grounded on the same
  // baseline as the house and the billboard, in the gap before the tree.
  {
    sheet: "clothesline",
    x: desktopCenterCol + 4,
    y: houseY + houseH - 19 / 16,
    alt: "A clothesline strung with a shirt, shorts and a towel",
  },

  // A small fenced pen with a cow.
  {
    sheet: "fenceCorral",
    x: desktopCenterCol + 4.31,
    y: corralY,
    alt: "A fenced pen",
  },
  {
    sheet: "cowIdle",
    // Horizontally centered over the corral above — its frame is wider
    // than the pen (lots of transparent padding around the animal, like
    // the bunny's own frame).
    x: desktopCenterCol + 4.31 + (30 / 16 - 3) / 2,
    y: cowY,
    // Forces this above the corral in paint order even though its y no
    // longer guarantees that on its own (see the DecorItem.z doc) — the
    // corral's rails are part of the same sprite as its open middle, so
    // without this the rails paint over the cow's lower half.
    z: 1,
    row: 3, // front-facing, matching the bunny's row-3 "down" pose
    animated: true,
    fps: 5,
    frameCount: 8,
    alt: "A cow in the pen",
  },

  // Flower boxes flanking the house front, hand-placed via the Yard
  // Decorator artifact tool (see scripts/assets and the ArtifactData
  // read that pulled this layout in).
  { sheet: "planterYellow", x: 7.18, y: 6.92 },
  { sheet: "planterBlue", x: 6.37, y: 6.93 },
  { sheet: "planterYellow", x: 9.95, y: 6.89 },
  { sheet: "planterBlue", x: 10.76, y: 6.9 },

  // The rest of the hand-placed scatter: grass rings and flowers across
  // the otherwise-empty grass.
  { sheet: "grassRingA", x: 12.78, y: 7.91 },
  { sheet: "grassRingA", x: 16.31, y: 10.96 },
  { sheet: "grassRingA", x: 5.56, y: 9.75 },
  { sheet: "grassRingA", x: 2.96, y: 2.03 },
  { sheet: "grassRingA", x: 15.56, y: 1.51 },
  { sheet: "grassRingA", x: 0.14, y: 13.52 },
  { sheet: "flowerWhite", x: 0.3, y: 7.37 },
  { sheet: "flowerPurple", x: 5.19, y: 7.22 },
  { sheet: "flowerPurple", x: 16.73, y: 6.16 },
  // Landed past the canvas edge (x > 18) in the tool — pulled back onto
  // the grass rather than dropped, since they'd otherwise render off
  // the clipped edge of the scene.
  { sheet: "flowerWhite", x: 17.2, y: 0.84 },
  { sheet: "flowerWhite", x: 17.2, y: 9.4 },
];

// Two intermediate tiers between the full desktop scene and the mobile
// stack (see LandingScene's four-way className split): rather than
// jumping straight from "everything" to "just the house", the yard
// sheds its rightmost items one at a time as the viewport narrows, and
// the canvas (cols) shrinks to match so the remaining scene recenters
// instead of leaving empty grass where the dropped item used to be.
// Both reuse desktopCenterCol — the billboard-to-house gap and the
// clothesline/corral offsets are all relative to it already, so the
// house and billboard don't need to move, only the canvas around them.
//
// Tier 1 (tabletWide): drop the tree — it's the furthest-right, purely
// decorative item, and the first thing that stops fitting. cols=15
// trims to the clothesline/corral's right edge (centerCol + 6.5) plus
// a small margin.
export const tabletWidePath: TileCoord[] = rect(desktopCenterCol, 2, 2, 10);
export const tabletWideGrid: PathGrid = { cols: 15, visibleRows: 15 };
export const tabletWideDecor: DecorItem[] = desktopDecor.filter(
  (item) =>
    item.sheet !== "bushTree" &&
    // Scatter that was hand-placed to land near/past the 18-wide
    // canvas's right edge (see the comment on desktopDecor below) falls
    // outside this narrower one too — drop rather than let it clip.
    item.x < tabletWideGrid.cols - 1,
);

// Tier 2 (tabletNarrow): drop the clothesline and the corral/cow with
// it — once the clothesline's gone there's no yard left to pen the cow
// into, and the two were always a matched pair at roughly the same x.
// cols=12 trims to the house's own right edge (centerCol + 1 + houseW/2)
// plus a small margin; below this, there's no room left for the
// billboard beside the house at all (see mobileGrid's doc), so this is
// the last side-by-side tier before the layout stacks instead.
export const tabletNarrowPath: TileCoord[] = rect(desktopCenterCol, 2, 2, 10);
export const tabletNarrowGrid: PathGrid = { cols: 12, visibleRows: 15 };
export const tabletNarrowDecor: DecorItem[] = desktopDecor.filter(
  (item) =>
    item.sheet !== "bushTree" &&
    item.sheet !== "clothesline" &&
    item.sheet !== "fenceCorral" &&
    item.sheet !== "cowIdle" &&
    item.x < tabletNarrowGrid.cols - 1,
);

// The billboard (see Billboard.tsx) takes the spot the left-hand tree
// used to have, carrying the full intro blurb. Its support posts are
// planted at the same ground line as the house's base. On the wide
// desktop grid (and both tablet tiers above — the billboard never
// moves, only the yard around it shrinks) it sits beside the house; the
// narrow mobile grid has no room beside the house (see mobileDecor
// below), so it stacks above the house instead — the first thing you
// see, rather than something you'd have to scroll the bunny's yard to
// find.
// Widened (and nudged left) from the original 5.5 @ x:0.4 now that the
// type is bigger — still capped by the gap to the house's left edge
// (houseX, 6.375): x + width must clear it by at least ~0.35 tiles, so
// this is close to the widest this can go without shifting the house
// over too (desktopCenterCol).
const billboardW = 5.7;
// The board's own height (padding + heading + body copy) is content-
// driven, not tile-scaled, so this is measured against a render rather
// than computed — retune if the copy or type scale changes enough to
// throw it off.
const desktopBillboardHeightTiles = 2.6;
export const desktopBillboard = {
  x: 0.3,
  y: houseY + houseH - desktopBillboardHeightTiles,
  width: billboardW,
  height: desktopBillboardHeightTiles,
};

// The BunnyRoutine's two stops (see LandingScene.tsx): its usual spot on
// the path below the door, and a stop between the billboard's two
// posts — centered between the flowerWhite (x: 0.3) and flowerPurple
// (x: 5.19) planted there above. Raised above their y the same way the
// planter-watering spot was (see the old commit): the watering stream
// pours from partway down the bunny's frame, so standing level with the
// flowers would send it past them onto the grass beyond.
export const bunnyHome = { x: desktopCenterCol - 0.5, y: houseY + houseH - 0.5 };
export const bunnyBillboardStop = { x: 2.75, y: 5.9 };
// Margin trimmed from 1.5 to 0.8 (0.4 a side) now that the type is
// bigger, so the board claims more of the narrow grid instead of
// shrinking further inside it.
const mobileBillboardW = mobileGrid.cols - 0.8;
// The board's own height on the mobile/tablet stack — narrower text
// column than desktop's, but wider than you'd think from the billboard's
// tile width since the intro copy is the same length; measured against
// a render like desktopBillboardHeightTiles above, so retune if the
// copy or type scale changes enough to throw it off.
const mobileBillboardHeightTiles = 2.7;
// Right under the navbar — much tighter than desktop's houseY clearance,
// since there's no roof to clear here, just the board itself.
const mobileTopGap = 0.3;
export const mobileBillboard = {
  x: (mobileGrid.cols - mobileBillboardW) / 2,
  y: mobileTopGap,
  width: mobileBillboardW,
  height: mobileBillboardHeightTiles,
};

// Everything below the billboard on the mobile/tablet stack hangs off
// this, so the whole yard shifts down as a unit to clear the board
// above it. 0.6 is breathing room for the board's support posts, which
// poke out a little below the board itself.
const mobileHouseY = mobileTopGap + mobileBillboardHeightTiles + 0.6;

// The house is scaled down (not just moved) on the mobile stack — full
// size it was the single biggest thing on the screen, crowding out the
// banner and the bunny below it. Shrunk in place via DecorSprite's
// `scale`, anchored to its own top-center (see DecorItem.scale) so the
// values above still mark where it sits — a scaled item's effective
// footprint is houseH * mobileHouseScale, not houseH, which is what
// everything below (bunny, tree, flowers) measures off of.
const mobileHouseScale = 0.6;
const mobileHouseBottom = mobileHouseY + houseH * mobileHouseScale;

// The road: starts a row above the house's (scaled) bottom edge, so its
// top tile is mostly hidden under the house art and only peeks out right
// at the door — the same "painted after the path, so it covers it"
// trick the desktop/tablet tiers use (see SceneCanvas) — then runs on
// past the house for the bunny to stand on, in front of it rather than
// beside it. Path tiles are integer rows for the autotiler (unlike the
// fractional decor positions above), so this rounds down to the nearest
// one rather than tracking mobileHouseBottom exactly.
const mobilePathStartRow = Math.floor(mobileHouseBottom) - 1;
export const mobilePath: TileCoord[] = rect(mobileCenterCol, mobilePathStartRow, 2, 4);

// Where the mobile-stack bunny starts/idles — just past the house's
// (scaled) bottom edge, nudged up a bit closer to the door (scaled down
// from the desktop tier's own raise, since the house itself is smaller
// here — see mobileHouseScale).
export const mobileBunnyHome = { x: mobileCenterCol - 0.5, y: mobileHouseBottom - 0.15 };

// On the narrow mobile grid the house nearly fills the width, so there's
// no room to flank it with trees the way the desktop layout does —
// they're tucked in at ground level beside the bunny instead.
export const mobileDecor: DecorItem[] = [
  {
    sheet: "house",
    // Centered the same way the path above is (mobileCenterCol + 1 ==
    // mobileGrid.cols / 2) — (cols - houseW) / 2 lands on that same
    // midpoint, and the top-center scale anchor (see DecorItem.scale)
    // keeps it there at any scale.
    x: (mobileGrid.cols - houseW) / 2,
    y: mobileHouseY,
    scale: mobileHouseScale,
    alt: "A small cottage below the sign",
  },

  // The same flower boxes flanking the door on desktop (see
  // desktopDecor), scaled and repositioned to flank this smaller house.
  // Unlike the house/path above, this isn't just "scale the desktop x":
  // DecorSprite's scale anchor is top-CENTER, so what has to land at
  // `houseCenterX + scale * centerOffset` is each planter's own center
  // (x + planterW / 2), not its left edge — and planterW / 2 is a fixed
  // offset from that center regardless of scale (shrinking happens
  // around the center, it doesn't move it). Scaling planterW / 2 along
  // with centerOffset (as an earlier version of this did, by scaling
  // desktop's left-edge x's wholesale) pushes the left pair in and the
  // right pair out — the house's own left-edge x above gets away with
  // the simpler version only because a single item's own half-width
  // cancels out against DecorSprite's center anchor.
  //
  // centerOffset is each desktop planter's (x + planterW / 2) minus the
  // house's own center (desktopCenterCol + 1 = 9); y is 5.9 tiles below
  // the house's top (houseY), scaled the same simple way since height
  // isn't split across a center the way width is.
  { sheet: "planterBlue", x: mobileGrid.cols / 2 + -2.1925 * mobileHouseScale - planterW / 2, y: mobileHouseY + 5.9 * mobileHouseScale, scale: mobileHouseScale },
  { sheet: "planterYellow", x: mobileGrid.cols / 2 + -1.3825 * mobileHouseScale - planterW / 2, y: mobileHouseY + 5.9 * mobileHouseScale, scale: mobileHouseScale },
  { sheet: "planterYellow", x: mobileGrid.cols / 2 + 1.3875 * mobileHouseScale - planterW / 2, y: mobileHouseY + 5.9 * mobileHouseScale, scale: mobileHouseScale },
  { sheet: "planterBlue", x: mobileGrid.cols / 2 + 2.1975 * mobileHouseScale - planterW / 2, y: mobileHouseY + 5.9 * mobileHouseScale, scale: mobileHouseScale },

  // The bunny itself is the interactive BunnyRoutine component (see
  // LandingScene.tsx), not a static DecorItem here, so it can respond to
  // scroll/arrow-key input on touch devices too — see mobileBunnyHome
  // below for where it starts.

  { sheet: "bushTree", x: mobileGrid.cols - 1.9, y: mobileHouseBottom + 0.5 },

  // A light scatter of flowers and weeds — much sparser than desktop
  // since there's little empty grass to work with, tucked into the
  // narrow margins beside the house and around the bunny. The two
  // beside the house are at the same fraction down its (now shorter)
  // height as they were before it shrank.
  { sheet: "flowerWhite", x: 0.3, y: mobileHouseY + 2 * mobileHouseScale },
  { sheet: "grassTuft", x: mobileGrid.cols - 0.9, y: mobileHouseY + 1.5 * mobileHouseScale },
  { sheet: "flowerPurple", x: 0.4, y: mobileHouseBottom + 3.2 },
];

// Obstacle boxes for each tier, computed once at module load (not inline
// in LandingScene's JSX) so BunnyRoutine gets a stable array reference —
// otherwise a new array every render would re-trigger its effect and
// snap the bunny back to its starting position.
export const desktopObstacles = sceneObstacles(desktopDecor, desktopBillboard);
export const tabletWideObstacles = sceneObstacles(tabletWideDecor, desktopBillboard);
export const tabletNarrowObstacles = sceneObstacles(tabletNarrowDecor, desktopBillboard);
export const mobileObstacles = sceneObstacles(mobileDecor, mobileBillboard);
