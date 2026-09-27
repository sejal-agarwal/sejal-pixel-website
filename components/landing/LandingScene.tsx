import { Sprite } from "@/components/sprite/Sprite";
import { sheets } from "@/lib/sprites";
import { resolvePathTile, toPathSet } from "@/lib/map/autotile";
import {
  desktopPath,
  desktopGrid,
  mobilePath,
  mobileGrid,
  type TileCoord,
  type PathGrid,
} from "@/lib/map/landingMap";

const TILE = 16;

/**
 * The landing area: a full-bleed grass field with the dirt path snaking
 * down through it. House/trees/bunny/etc. are layered on in later
 * checkpoints; this is ground + path only (CP3).
 */
export function LandingScene() {
  return (
    <section
      id="home"
      aria-hidden
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: "var(--color-grass)" }}
    >
      <PathCanvas
        path={desktopPath}
        grid={desktopGrid}
        className="hidden sm:block"
      />
      <PathCanvas path={mobilePath} grid={mobileGrid} className="sm:hidden" />
    </section>
  );
}

function PathCanvas({
  path,
  grid,
  className,
}: {
  path: TileCoord[];
  grid: PathGrid;
  className?: string;
}) {
  const pathSet = toPathSet(path);

  return (
    <div
      className={`relative mx-auto${className ? ` ${className}` : ""}`}
      style={{
        width: `calc(${grid.cols} * var(--px) * ${TILE}px)`,
        height: `calc(${grid.visibleRows} * var(--px) * ${TILE}px)`,
      }}
    >
      {path.map(([col, row]) => {
        const frame = resolvePathTile(pathSet, col, row);
        return (
          <Sprite
            key={`${col},${row}`}
            sheet={frame.sheet ? sheets[frame.sheet] : sheets.autotile}
            col={frame.col}
            row={frame.row}
            className="absolute top-0 left-0"
            style={{
              transform: `translate(calc(${col} * var(--px) * ${TILE}px), calc(${row} * var(--px) * ${TILE}px))`,
            }}
          />
        );
      })}
    </div>
  );
}
