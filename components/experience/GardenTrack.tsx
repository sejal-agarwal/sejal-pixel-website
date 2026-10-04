import type { CSSProperties } from "react";
import { sheets } from "@/lib/sprites";

/**
 * The vertical dirt path running down the garden, built from the same
 * autotile sheet as LandingScene's path (see pathEdgeW/pathEdgeE in
 * lib/sprites.ts and .path-column in globals.css) but as a simple
 * `repeat-y` strip rather than a resolved tile grid — the garden's
 * length depends on how many roles there are, not a fixed canvas.
 *
 * `gridColumn` places it in the zigzag's center column or the list's
 * left column (see Garden.tsx); `rows` is how many grid rows (one per
 * plot) it needs to span. Carries `data-garden-track` so GardenBunny
 * can find its horizontal center — the bunny always stands on the path
 * itself, not out on a plot's soil bed, even while watering it.
 *
 * `position: relative` + a z-index above 0 here is load-bearing: a
 * spur (see GardenSpur) is `position: absolute`, which always paints
 * above a plain static element like this one regardless of DOM order —
 * without this, each spur's own grass-edge cap texture painted over
 * the trunk right where they cross, showing as a visible break in an
 * otherwise continuous path.
 */
export function GardenTrack({ gridColumn, rows }: { gridColumn: number; rows: number }) {
  return (
    <li
      aria-hidden
      data-garden-track
      className="relative z-10 flex list-none justify-self-center"
      style={{ gridColumn, gridRow: `1 / span ${rows}` }}
    >
      <span className="path-column" style={{ "--tile-url": `url(${sheets.pathEdgeW.src})` } as CSSProperties} />
      <span className="path-column" style={{ "--tile-url": `url(${sheets.pathEdgeE.src})` } as CSSProperties} />
    </li>
  );
}
