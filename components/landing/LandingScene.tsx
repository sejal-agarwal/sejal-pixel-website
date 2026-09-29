import { Sprite } from "@/components/sprite/Sprite";
import { AnimatedSprite } from "@/components/sprite/AnimatedSprite";
import { Billboard } from "@/components/landing/Billboard";
import { sheets, type SheetName } from "@/lib/sprites";
import { resolvePathTile, toPathSet } from "@/lib/map/autotile";
import {
  desktopPath,
  desktopGrid,
  desktopDecor,
  desktopBillboard,
  mobilePath,
  mobileGrid,
  mobileDecor,
  mobileBillboard,
  type TileCoord,
  type PathGrid,
  type DecorItem,
} from "@/lib/map/landingMap";

const TILE = 16;

/**
 * The landing area: a full-bleed grass field with the house, a few
 * flanking trees, the bunny at the door, and the autotiled dirt path
 * leading away from it. Sized to roughly one screen (see visibleRows in
 * landingMap.ts) rather than a long scroll, with the path always centered
 * under the house. The fence pen, campfire, lamps, crop patch, chest and
 * signpost are deferred to a later pass — see landingMap.ts.
 */
export function LandingScene() {
  return (
    <section
      id="home"
      aria-hidden
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: "var(--color-grass)",
        // The canvases below are absolutely positioned (so they can
        // center themselves past the viewport edge without margin:auto
        // collapsing to 0 when they're wider than the viewport — see
        // SceneCanvas), which takes them out of flow. Both grids share
        // the same visibleRows, so either works here to size the section.
        height: `calc(${desktopGrid.visibleRows} * var(--px) * ${TILE}px)`,
      }}
    >
      <SceneCanvas
        path={desktopPath}
        grid={desktopGrid}
        decor={desktopDecor}
        billboard={desktopBillboard}
        className="hidden sm:block"
      />
      <SceneCanvas
        path={mobilePath}
        grid={mobileGrid}
        decor={mobileDecor}
        billboard={mobileBillboard}
        className="sm:hidden"
      />
    </section>
  );
}

function SceneCanvas({
  path,
  grid,
  decor,
  billboard,
  className,
}: {
  path: TileCoord[];
  grid: PathGrid;
  decor: DecorItem[];
  billboard: { x: number; y: number; width: number };
  className?: string;
}) {
  const pathSet = toPathSet(path);
  // Depth sort: items further down the scene (larger y) paint later, so
  // e.g. a tree's canopy can overlap something above it without the
  // stacking order looking inverted.
  const sortedDecor = [...decor].sort((a, b) => a.y - b.y);

  return (
    <div
      className={`absolute top-0${className ? ` ${className}` : ""}`}
      style={{
        left: "50%",
        width: `calc(${grid.cols} * var(--px) * ${TILE}px)`,
        height: `calc(${grid.visibleRows} * var(--px) * ${TILE}px)`,
        transform: "translateX(-50%)",
      }}
    >
      {path.map(([col, row]) => {
        const frame = resolvePathTile(pathSet, col, row);
        return (
          <Sprite
            key={`path-${col},${row}`}
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

      {sortedDecor.map((item, i) => (
        <DecorSprite key={`decor-${i}`} item={item} />
      ))}

      <Billboard x={billboard.x} y={billboard.y} width={billboard.width} />
    </div>
  );
}

function DecorSprite({ item }: { item: DecorItem }) {
  const sheet = sheets[item.sheet as SheetName];
  const style = {
    transform: `translate(calc(${item.x} * var(--px) * ${TILE}px), calc(${item.y} * var(--px) * ${TILE}px))`,
  };

  if (item.animated) {
    return (
      <AnimatedSprite
        sheet={sheet}
        row={item.row ?? 0}
        fps={item.fps}
        frameCount={item.frameCount}
        alt={item.alt}
        className="absolute top-0 left-0"
        style={style}
      />
    );
  }

  return (
    <Sprite
      sheet={sheet}
      col={0}
      row={item.row ?? 0}
      alt={item.alt}
      className={`absolute top-0 left-0 ${item.smooth ? "sprite-smooth" : ""}`}
      style={style}
    />
  );
}
