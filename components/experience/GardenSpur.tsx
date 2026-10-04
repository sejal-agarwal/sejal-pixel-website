import type { CSSProperties } from "react";
import { sheets } from "@/lib/sprites";

// How many tiles long a spur reaches out from the soil bed — purely
// decorative, so this is just "far enough to read as a branch path."
const SPUR_LENGTH_TILES = 4;

/**
 * A short branch path off the main trunk, toward a zigzag-layout plot
 * (lg+ only — see GardenPlot's `showSpur`/`flip`). Built the same way
 * as the trunk (GardenTrack) — two autotile edge tiles tiled with CSS —
 * just rotated 90°: pathEdgeN/pathEdgeS stacked and tiled with
 * `repeat-x` instead of pathEdgeW/pathEdgeE tiled with `repeat-y`, so
 * it comes out the same 2-tile thickness as the trunk it branches from.
 */
export function GardenSpur({ side }: { side: "left" | "right" }) {
  // A spur on the soil bed's left edge must extend further left, so its
  // own right edge sits flush against the soil bed (`right: 100%`) —
  // and the mirror image for the right edge (`left: 100%`). Using
  // `[side]: "100%"` directly here was backwards (it anchored each spur
  // to the opposite edge from its name), which sent it off away from
  // the trunk instead of toward it.
  const anchor = side === "left" ? "right" : "left";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-1/2 hidden -translate-y-1/2 flex-col lg:flex"
      style={
        {
          width: `calc(${SPUR_LENGTH_TILES} * var(--px) * 16px)`,
          [anchor]: "100%",
        } as CSSProperties
      }
    >
      <span className="path-row" style={{ "--tile-url": `url(${sheets.pathEdgeN.src})` } as CSSProperties} />
      <span className="path-row" style={{ "--tile-url": `url(${sheets.pathEdgeS.src})` } as CSSProperties} />
    </div>
  );
}
