import type { ReactNode } from "react";
import { Sprite } from "@/components/sprite/Sprite";
import { AnimatedSprite } from "@/components/sprite/AnimatedSprite";
import { Billboard } from "@/components/landing/Billboard";
import { BunnyRoutine } from "@/components/landing/BunnyRoutine";
import { sheets, type SheetName } from "@/lib/sprites";
import { resolvePathTile, toPathSet } from "@/lib/map/autotile";
import {
  desktopPath,
  desktopGrid,
  desktopDecor,
  desktopBillboard,
  bunnyHome,
  bunnyBillboardStop,
  tabletWidePath,
  tabletWideGrid,
  tabletWideDecor,
  tabletNarrowPath,
  tabletNarrowGrid,
  tabletNarrowDecor,
  mobilePath,
  mobileGrid,
  mobileDecor,
  mobileBillboard,
  mobileBunnyHome,
  desktopObstacles,
  tabletWideObstacles,
  tabletNarrowObstacles,
  mobileObstacles,
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
        // SceneCanvas), which takes them out of flow, so the section needs
        // its own height to reserve the right amount of space in the
        // page. desktop/tabletWide/tabletNarrowGrid all share visibleRows
        // (15), but the stacked mobile layout is shorter (13, see
        // mobileGrid's doc) — --scene-rows (globals.css) switches between
        // them at the same 840px breakpoint the className splits below do.
        height: `calc(var(--scene-rows, ${desktopGrid.visibleRows}) * var(--px) * ${TILE}px)`,
      }}
    >
      <SceneCanvas
        path={desktopPath}
        grid={desktopGrid}
        decor={desktopDecor}
        billboard={desktopBillboard}
        className="hidden xl:block"
      >
        <BunnyRoutine
          home={bunnyHome}
          sign={bunnyBillboardStop}
          path={desktopPath}
          bounds={desktopGrid}
          obstacles={desktopObstacles}
        />
      </SceneCanvas>
      {/* Tablet, wide: same billboard+house composition as desktop, minus
          the tree — see tabletWideDecor's doc in landingMap.ts. */}
      <SceneCanvas
        path={tabletWidePath}
        grid={tabletWideGrid}
        decor={tabletWideDecor}
        billboard={desktopBillboard}
        className="hidden lg:block xl:hidden"
      >
        <BunnyRoutine
          home={bunnyHome}
          sign={bunnyBillboardStop}
          path={tabletWidePath}
          bounds={tabletWideGrid}
          obstacles={tabletWideObstacles}
        />
      </SceneCanvas>
      {/* Tablet, narrow: minus the clothesline/corral/cow too — see
          tabletNarrowDecor's doc. The last tier with the billboard
          beside the house; below this it stacks above instead. */}
      <SceneCanvas
        path={tabletNarrowPath}
        grid={tabletNarrowGrid}
        decor={tabletNarrowDecor}
        billboard={desktopBillboard}
        className="hidden min-[840px]:block lg:hidden"
      >
        <BunnyRoutine
          home={bunnyHome}
          sign={bunnyBillboardStop}
          path={tabletNarrowPath}
          bounds={tabletNarrowGrid}
          obstacles={tabletNarrowObstacles}
        />
      </SceneCanvas>
      <SceneCanvas
        path={mobilePath}
        grid={mobileGrid}
        decor={mobileDecor}
        billboard={mobileBillboard}
        className="min-[840px]:hidden"
      >
        {/* No scripted watering stop on the stacked mobile layout — the
            billboard sits above the house, not beside it, so there's no
            level walk to a flower bed. Scroll/arrow keys still work. */}
        <BunnyRoutine
          home={mobileBunnyHome}
          sign={mobileBunnyHome}
          path={mobilePath}
          bounds={mobileGrid}
          obstacles={mobileObstacles}
        />
      </SceneCanvas>
    </section>
  );
}

function SceneCanvas({
  path,
  grid,
  decor,
  billboard,
  className,
  children,
}: {
  path: TileCoord[];
  grid: PathGrid;
  decor: DecorItem[];
  billboard: { x: number; y: number; width: number };
  className?: string;
  children?: ReactNode;
}) {
  const pathSet = toPathSet(path);
  // Depth sort: items further down the scene (larger y) paint later, so
  // e.g. a tree's canopy can overlap something above it without the
  // stacking order looking inverted. z is an explicit override for the
  // rare item whose paint order can't just follow y — see DecorItem.z.
  const sortedDecor = [...decor].sort((a, b) => (a.z ?? 0) - (b.z ?? 0) || a.y - b.y);

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

      {children}
    </div>
  );
}

function DecorSprite({ item }: { item: DecorItem }) {
  const sheet = sheets[item.sheet as SheetName];
  const style = {
    // Shrinking (item.scale) is appended to the same transform rather
    // than set separately, since a style object only gets one transform
    // — and anchored top-center (not the default 50% 50%) so x/y still
    // mark its top edge and horizontal center at any scale. See
    // DecorItem.scale's doc.
    transform: `translate(calc(${item.x} * var(--px) * ${TILE}px), calc(${item.y} * var(--px) * ${TILE}px))${item.scale ? ` scale(${item.scale})` : ""}`,
    transformOrigin: item.scale ? "top" : undefined,
  };

  if (item.animated) {
    return (
      <AnimatedSprite
        sheet={sheet}
        row={item.row ?? 0}
        rows={item.rows}
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
