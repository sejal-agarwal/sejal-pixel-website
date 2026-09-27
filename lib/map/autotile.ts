/**
 * Path tile coordinates (16px grid units into
 * Autotile_Grass_and_Dirt_Path_Tileset.png). The sheet doesn't ship a
 * classic single-tile "blob" autotile — it's built from garden-bed border
 * pieces (a rounded-corner square bed) — but those pieces are exactly a
 * 9-slice: 4 corners, 4 edges, and a solid interior fill. Fed a *filled*
 * path region (2+ tiles wide, not a thin line) it autotiles like a normal
 * blob tileset.
 *
 * Coordinates were verified by sampling actual pixel colors per tile
 * (see the CP3 checkpoint notes) after an earlier visual-only read had
 * rows 3/4/5 off by one — row 5 in particular is fully transparent, and
 * a couple of tiles pointed at it, which rendered as invisible gaps that
 * let the section's background color show through as a "floating grass
 * island" in the middle of the path.
 */
const TILES = {
  fill: { col: 16, row: 2 }, // all 4 neighbours present → solid interior
  edgeN: { col: 16, row: 1 }, // grass north border only
  edgeS: { col: 16, row: 3 }, // grass south border only
  edgeE: { col: 17, row: 2 }, // grass east border only
  edgeW: { col: 15, row: 2 }, // grass west border only
  cornerSE: { col: 15, row: 1 }, // grass top+left → connects S+E
  cornerSW: { col: 17, row: 1 }, // grass top+right → connects S+W
  cornerNE: { col: 15, row: 3 }, // grass bottom+left → connects N+E
  cornerNW: { col: 17, row: 3 }, // grass bottom+right → connects N+W
  capS: { col: 14, row: 1 }, // rounded cap, opens south only
  capN: { col: 14, row: 3 }, // rounded cap, opens north only
  capE: { col: 15, row: 4 }, // rounded cap, opens east only
  capW: { col: 17, row: 4 }, // rounded cap, opens west only
  isolated: { col: 14, row: 4 }, // no connections (ringed on all sides)
} as const;

// Concave corner tiles — see lib/sprites.ts `autotileConcave` and
// scripts/generate-concave-corners.py. Used only when all 4 orthogonal
// neighbours are path but one diagonal neighbour isn't: a genuine inside
// corner, which the source sheet has no piece for.
const CONCAVE = {
  NE: { sheet: "autotileConcave" as const, col: 0, row: 0 },
  NW: { sheet: "autotileConcave" as const, col: 1, row: 0 },
  SE: { sheet: "autotileConcave" as const, col: 2, row: 0 },
  SW: { sheet: "autotileConcave" as const, col: 3, row: 0 },
} as const;

const N = 1;
const E = 2;
const S = 4;
const W = 8;

export type AutotileFrame =
  | { col: number; row: number; sheet?: undefined }
  | { col: number; row: number; sheet: "autotileConcave" };
export type PathSet = Set<string>;

export function cellKey(col: number, row: number): string {
  return `${col},${row}`;
}

export function toPathSet(cells: Iterable<readonly [number, number]>): PathSet {
  const set: PathSet = new Set();
  for (const [c, r] of cells) set.add(cellKey(c, r));
  return set;
}

/**
 * Picks the right tile for (col,row) based on which of its 4 orthogonal
 * neighbours are also in `pathSet` — a full 9-slice blob resolver, so it
 * works for any filled path shape (straight runs, wide turns, taper
 * points), not just a 1-wide line. When all 4 orthogonal neighbours are
 * path, it also checks the 4 diagonals: exactly one missing means this
 * cell sits at the inside of a bend, so it gets a concave corner tile
 * instead of a plain fill.
 */
export function resolvePathTile(pathSet: PathSet, col: number, row: number): AutotileFrame {
  let mask = 0;
  if (pathSet.has(cellKey(col, row - 1))) mask |= N;
  if (pathSet.has(cellKey(col + 1, row))) mask |= E;
  if (pathSet.has(cellKey(col, row + 1))) mask |= S;
  if (pathSet.has(cellKey(col - 1, row))) mask |= W;

  if (mask === (N | E | S | W)) {
    const hasNE = pathSet.has(cellKey(col + 1, row - 1));
    const hasNW = pathSet.has(cellKey(col - 1, row - 1));
    const hasSE = pathSet.has(cellKey(col + 1, row + 1));
    const hasSW = pathSet.has(cellKey(col - 1, row + 1));
    const missing = [!hasNE, !hasNW, !hasSE, !hasSW].filter(Boolean).length;
    if (missing === 1) {
      if (!hasNE) return CONCAVE.NE;
      if (!hasNW) return CONCAVE.NW;
      if (!hasSE) return CONCAVE.SE;
      return CONCAVE.SW;
    }
    return TILES.fill;
  }

  switch (mask) {
    case E | S | W: // N missing
      return TILES.edgeN;
    case N | E | W: // S missing
      return TILES.edgeS;
    case N | S | W: // E missing
      return TILES.edgeE;
    case N | E | S: // W missing
      return TILES.edgeW;
    case S | E:
      return TILES.cornerSE;
    case S | W:
      return TILES.cornerSW;
    case N | E:
      return TILES.cornerNE;
    case N | W:
      return TILES.cornerNW;
    case N | S:
      return TILES.edgeE; // shouldn't occur in a 2+ wide blob; sane fallback
    case E | W:
      return TILES.edgeN; // shouldn't occur in a 2+ wide blob; sane fallback
    case S:
      return TILES.capS;
    case N:
      return TILES.capN;
    case E:
      return TILES.capE;
    case W:
      return TILES.capW;
    default:
      return TILES.isolated;
  }
}
