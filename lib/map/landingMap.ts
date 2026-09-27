// The landing scene's dirt path, authored as a filled region (2-3 tiles
// wide) rather than a 1-wide line — a thin line reads as a choppy zigzag
// once autotiled, while a wide region with long straight runs and a
// single gentle jog reads as a real path. Built from a couple of
// overlapping rectangles; the autotile resolver figures out edges,
// corners, and fill automatically from the union.
//
// The last couple of rows in each path deliberately run a bit past
// `visibleRows`: the scene container clips them with overflow:hidden, so
// the path always looks like it continues off-screen at the bottom
// instead of ending in a rounded edge.

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

function union(...groups: TileCoord[][]): TileCoord[] {
  const seen = new Set<string>();
  const out: TileCoord[] = [];
  for (const group of groups) {
    for (const cell of group) {
      const key = `${cell[0]},${cell[1]}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(cell);
      }
    }
  }
  return out;
}

// Both desktop and mobile use the same 2-wide thickness now (matching
// the mobile corridor from the previous version, which read cleanly).
// A uniform-width corridor only ever needs the tileset's convex corner
// pieces at a turn's *outer* edge; the inner/concave side of every turn
// falls back to a plain fill tile since the sheet has no concave corner
// piece. That's a real limitation of the source art, not a bug — it's
// most visible on a tight bend, least visible on a wide sweeping one.

// Desktop: an S-curve — vertical, a wide 90° jog right, vertical again —
// so a couple of real turns are visible without cramming them close
// together like the very first (too zigzaggy) attempt.
export const desktopPath: TileCoord[] = union(
  rect(6, 2, 2, 6), // cols 6-7, rows 2-7: first vertical run
  rect(6, 6, 5, 2), // cols 6-10, rows 6-7: the turn (jogs right)
  rect(9, 6, 2, 14), // cols 9-10, rows 6-19 (2 extra clipped rows): second run
);
export const desktopGrid: PathGrid = { cols: 15, visibleRows: 17 };

// Mobile: the same S-curve shape, scaled down to fit a phone viewport.
export const mobilePath: TileCoord[] = union(
  rect(2, 2, 2, 5), // cols 2-3, rows 2-6
  rect(2, 5, 4, 2), // cols 2-5, rows 5-6: the turn
  rect(4, 5, 2, 13), // cols 4-5, rows 5-17 (2 extra clipped rows)
);
export const mobileGrid: PathGrid = { cols: 8, visibleRows: 15 };
