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

export type TileCoord = [col: number, row: number];

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
const mobileCenterCol = 3;
export const mobilePath: TileCoord[] = rect(mobileCenterCol, 2, 2, 10);
// A few rows taller than desktop strictly needs, but both grids share
// visibleRows (see LandingScene) and mobile's stacked layout — house,
// bunny, sign, billboard, all in a single column — needs the room.
export const mobileGrid: PathGrid = { cols: 8, visibleRows: 15 };

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
};

// House sprite is 84x96px (5.25 x 6 tiles); centered over the
// 2-tile-wide path with its base a little past the path's start row.
const houseW = 84 / 16;
const houseH = 96 / 16;

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
const billboardW = 5.5;
// The board's own height (padding + heading + body copy) is content-
// driven, not tile-scaled, so this is measured against a render rather
// than computed — retune if the copy or type scale changes enough to
// throw it off.
const desktopBillboardHeightTiles = 2.36;
export const desktopBillboard = {
  x: 0.4,
  y: houseY + houseH - desktopBillboardHeightTiles,
  width: billboardW,
};

// The BunnyRoutine's two stops (see LandingScene.tsx): its usual spot on
// the path below the door, and a stop between the billboard's two
// posts — centered between the flowerWhite (x: 0.3) and flowerPurple
// (x: 5.19) planted there above. Raised above their y the same way the
// planter-watering spot was (see the old commit): the watering stream
// pours from partway down the bunny's frame, so standing level with the
// flowers would send it past them onto the grass beyond.
export const bunnyHome = { x: desktopCenterCol - 0.5, y: houseY + houseH + 0.1 };
export const bunnyBillboardStop = { x: 2.75, y: 5.9 };
const mobileBillboardW = mobileGrid.cols - 1.5;
// The board's own height on the mobile/tablet stack — narrower text
// column than desktop's, but wider than you'd think from the billboard's
// tile width since the intro copy is the same length; measured against
// a render like desktopBillboardHeightTiles above, so retune if the
// copy or type scale changes enough to throw it off.
const mobileBillboardHeightTiles = 2.4;
export const mobileBillboard = {
  x: (mobileGrid.cols - mobileBillboardW) / 2,
  // Leads the stack, at the same navbar-clearance offset the house's
  // roof uses on desktop (see houseY) — everything below (house, bunny,
  // tree, flowers) is pushed down by the board's own height to make
  // room, via mobileHouseY below.
  y: houseY,
  width: mobileBillboardW,
};

// Everything below the billboard on the mobile/tablet stack hangs off
// this instead of houseY directly, so the whole yard shifts down as a
// unit to clear the board above it. 0.6 is breathing room for the
// board's support posts, which poke out a little below the board itself.
const mobileHouseY = houseY + mobileBillboardHeightTiles + 0.6;

// On the narrow mobile grid the house nearly fills the width, so there's
// no room to flank it with trees the way the desktop layout does —
// they're tucked in at ground level beside the bunny instead.
export const mobileDecor: DecorItem[] = [
  {
    sheet: "house",
    x: (mobileGrid.cols - houseW) / 2,
    y: mobileHouseY,
    alt: "A small cottage below the sign",
  },
  {
    sheet: "bunnyIdle",
    x: mobileCenterCol - 0.5,
    y: mobileHouseY + houseH + 0.1,
    row: 3,
    animated: true,
    fps: 6,
    frameCount: 5,
    alt: "Bunny idling on the grass outside the cottage",
  },

  { sheet: "bushTree", x: mobileGrid.cols - 1.9, y: mobileHouseY + houseH + 0.4 },

  // A light scatter of flowers and weeds — much sparser than desktop
  // since there's little empty grass to work with, tucked into the
  // narrow margins beside the house and around the bunny.
  { sheet: "flowerWhite", x: 0.3, y: mobileHouseY + 2 },
  { sheet: "grassTuft", x: mobileGrid.cols - 0.9, y: mobileHouseY + 1.5 },
  { sheet: "flowerPurple", x: 0.4, y: mobileHouseY + houseH + 3.2 },
];
