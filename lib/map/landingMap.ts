// The landing scene's layout: the dirt path (authored as a filled region,
// not a thin line — see the autotile notes for why) plus every decoration
// placed on top of it. Positions are in 16px tile units (TILE in
// LandingScene.tsx), fractional where it helps fine placement, since
// decorations are organic art that doesn't sit on the tile grid the way
// the path does.
//
// The house sits at the top of the path, centered over it; the bunny
// stands in front on the grass. The fence pen, campfire, lamps, crop
// patch, chest and signpost are still pulled out for now, kept to
// roughly one screen so the landing area doesn't scroll forever before
// the rest of the site — they come back in a later pass.

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

// Mobile
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
  row?: number;
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

export const desktopDecor: DecorItem[] = [
  {
    sheet: "house",
    x: desktopCenterCol + 1 - houseW / 2,
    y: houseY,
    alt: "A small cottage at the top of the path",
  },
  {
    sheet: "bunnyIdle",
    x: desktopCenterCol - 0.5,
    y: houseY + houseH + 0.1,
    row: 3,
    animated: true,
    fps: 6,
    frameCount: 5,
    alt: "Bunny idling on the grass outside the cottage",
  },

  // A rounded tree on the right, balancing the billboard on the left.
  { sheet: "bushTree", x: desktopCenterCol + 6.5, y: houseY + 3 },
];

// The billboard (see Billboard.tsx) takes the spot the left-hand tree
// used to have, carrying the full intro blurb. Its support posts are
// planted at the same ground line as the house's base. On the wide
// desktop grid it sits beside the house; the narrow mobile grid has no
// room beside the house (see mobileDecor above), so it stacks below.
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
const mobileBillboardW = mobileGrid.cols - 1.5;
export const mobileBillboard = {
  x: (mobileGrid.cols - mobileBillboardW) / 2,
  // Clear of the bunny's feet (it stands at houseY + houseH + 0.1,
  // 3 tiles tall).
  y: houseY + houseH + 3.3,
  width: mobileBillboardW,
};

// On the narrow mobile grid the house nearly fills the width, so there's
// no room to flank it with trees the way the desktop layout does —
// they're tucked in at ground level beside the bunny instead.
export const mobileDecor: DecorItem[] = [
  {
    sheet: "house",
    x: (mobileGrid.cols - houseW) / 2,
    y: houseY,
    alt: "A small cottage at the top of the path",
  },
  {
    sheet: "bunnyIdle",
    x: mobileCenterCol - 0.5,
    y: houseY + houseH + 0.1,
    row: 3,
    animated: true,
    fps: 6,
    frameCount: 5,
    alt: "Bunny idling on the grass outside the cottage",
  },

  { sheet: "bushTree", x: mobileGrid.cols - 1.9, y: houseY + houseH + 0.4 },
];
