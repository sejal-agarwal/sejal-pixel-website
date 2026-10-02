"use client";

import { useEffect, useState } from "react";
import { Sprite } from "@/components/sprite/Sprite";
import { sheets, directionRow, type Direction } from "@/lib/sprites";
import type { Rect, TileCoord } from "@/lib/map/landingMap";

type Point = { x: number; y: number };
type BunnySheet = "bunnyIdle" | "bunnyRun" | "bunnyWatering";
type Pose = { x: number; y: number; sheet: BunnySheet; row: number; col: number };

// Movement speeds, in tiles/sec.
const ROUTINE_WALK_SPEED = 3;
const INTERACTIVE_SPEED = 4.5;
// How long after the last scroll/arrow-key input before the bunny gives
// up and wanders back to its scripted routine.
const RESUME_DELAY_MS = 4000;
const IDLE_FRAME_MS = 1000 / 6;
const RUN_FRAME_MS = 1000 / 10;
const WATER_FRAME_MS = 1000 / 6;
const WATER_MS = 3000; // one 9-frame loop, repeated, facing right
// The bunny's 48x48 (3x3-tile) frame is mostly transparent padding — the
// actual drawn character (measured from the sprite PNGs) only occupies
// roughly x:[1,2] y:[0.9,2] tiles within it. Collision uses a small box
// right at its feet (the bottom of that drawn area), not the padded
// frame edges, plus a little breathing room (COLLISION_MARGIN) so it
// stops with a visible gap instead of touching obstacles pixel-exact.
const FOOT_X = 1;
const FOOT_Y = 1.7;
const FOOT_W = 1;
const FOOT_H = 0.3;
const COLLISION_MARGIN = 0.15;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function footBox(x: number, y: number): Rect {
  return {
    x0: x + FOOT_X - COLLISION_MARGIN,
    y0: y + FOOT_Y - COLLISION_MARGIN,
    x1: x + FOOT_X + FOOT_W + COLLISION_MARGIN,
    y1: y + FOOT_Y + FOOT_H + COLLISION_MARGIN,
  };
}

function overlaps(a: Rect, b: Rect) {
  return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
}

function blocked(x: number, y: number, obstacles: Rect[]) {
  const box = footBox(x, y);
  return obstacles.some((o) => overlaps(box, o));
}

function facingFromDelta(dx: number, dy: number, fallback: Direction): Direction {
  if (dx === 0 && dy === 0) return fallback;
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}

/**
 * The bunny: idles by the door, waters the billboard's flowers on a
 * scripted loop, and runs after them when the page scrolls or the
 * visitor holds an arrow key — either input interrupts the routine
 * immediately, and obstacles (house/trees/fences/billboard) block it.
 * Scroll always walks it onto the path first (if it isn't already
 * there) before running it up/down the path's length, rather than
 * cutting a diagonal straight to the scroll-mapped point. After a few
 * seconds of no input it wanders back home and resumes the routine.
 *
 * `home` and `sign` are in tile units, same as DecorItem; `sign` is
 * where the scripted watering stop is — pass `home` again to skip the
 * scripted loop entirely (the mobile stack has nowhere to water).
 * `path`/`bounds` describe where scroll can walk the bunny and how far
 * arrow keys may roam; `obstacles` are solid decor boxes to avoid.
 */
export function BunnyRoutine({
  home,
  sign,
  path,
  bounds,
  obstacles,
}: {
  home: Point;
  sign: Point;
  path?: TileCoord[];
  bounds: { cols: number; visibleRows: number };
  obstacles?: Rect[];
}) {
  const [pose, setPose] = useState<Pose>(() => ({ x: home.x, y: home.y, sheet: "bunnyIdle", row: 3, col: 0 }));

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return; // stays on the idle pose set above

    const enableRoutine = home.x !== sign.x || home.y !== sign.y;
    const obstacleList = obstacles ?? [];
    const minX = -FOOT_X;
    const maxX = bounds.cols - FOOT_X - FOOT_W;
    const minY = -FOOT_Y;
    const maxY = bounds.visibleRows - FOOT_Y - FOOT_H;

    // Scroll maps 0 -> home (where the bunny already stands) and 1 -> the
    // bottom of the path (larger row = further down/away from the house),
    // so scrolling down sends the bunny further down the path and
    // scrolling back up brings it back toward home.
    const pathRows = (path ?? []).map(([, row]) => row);
    const pathFarRow = pathRows.length ? Math.max(...pathRows) : home.y;
    // The path is usually several tiles wide (e.g. 2), so its visual
    // center is the midpoint between its leftmost and rightmost column
    // (+1 since columns are tile indices, not the tile's right edge) —
    // not just the first column's own center, which sat a whole tile off
    // to one side. Converted from that center back to the bunny's own
    // top-left x so its foot box (not its sprite frame) lands on it.
    const pathCols = (path ?? []).map(([col]) => col);
    const pathCenterCol = pathCols.length ? (Math.min(...pathCols) + Math.max(...pathCols) + 1) / 2 : home.x + FOOT_X + FOOT_W / 2;
    const pathX = pathCenterCol - FOOT_X - FOOT_W / 2;

    const keysDown = new Set<string>();
    const isArrowKey = (key: string) => key === "ArrowUp" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight";
    const isTypingTarget = (el: EventTarget | null) =>
      el instanceof HTMLElement && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isArrowKey(e.key) || isTypingTarget(e.target)) return;
      e.preventDefault();
      keysDown.add(e.key);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!isArrowKey(e.key)) return;
      keysDown.delete(e.key);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Current position/facing live in refs (not state) since they're
    // read and written every animation frame — state is only for render.
    const pos = { x: home.x, y: home.y };
    let facing: Direction = "down";
    let mode: "routine" | "keys" | "scroll" = "routine";
    let lastInteraction = -Infinity;
    let lastProgress = 0;

    // Scripted routine state: either walking back to `home` (any time
    // the routine is (re)entered somewhere else) or cycling the
    // idle/walk/water phases below once it's arrived.
    let homing = true;
    let phaseIndex = 0;
    let phaseStart = 0;

    const distance = Math.hypot(home.x - sign.x, home.y - sign.y);
    const walkMs = (distance / ROUTINE_WALK_SPEED) * 1000;
    const phases = [
      { sheet: "bunnyIdle" as const, row: 3, frameCount: 5, frameMs: IDLE_FRAME_MS, durationMs: 9000, from: home, to: home },
      { sheet: "bunnyRun" as const, row: directionRow[facingFromDelta(sign.x - home.x, sign.y - home.y, "down")], frameCount: 8, frameMs: RUN_FRAME_MS, durationMs: walkMs, from: home, to: sign },
      { sheet: "bunnyWatering" as const, row: 1, frameCount: 9, frameMs: WATER_FRAME_MS, durationMs: WATER_MS, from: sign, to: sign },
      { sheet: "bunnyRun" as const, row: directionRow[facingFromDelta(home.x - sign.x, home.y - sign.y, "down")], frameCount: 8, frameMs: RUN_FRAME_MS, durationMs: walkMs, from: sign, to: home },
    ];

    function getScrollProgress() {
      const section = document.getElementById("home");
      if (!section) return 0;
      const rect = section.getBoundingClientRect();
      return clamp(-rect.top / Math.max(1, rect.height), 0, 1);
    }

    function stepToward(target: Point, speed: number, dt: number) {
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 0.02) return false;
      const step = Math.min(dist, speed * dt);
      const dirX = dx / dist;
      const dirY = dy / dist;
      facing = facingFromDelta(dx, dy, facing);

      const tryX = clamp(pos.x + dirX * step, minX, maxX);
      if (!blocked(tryX, pos.y, obstacleList)) pos.x = tryX;
      const tryY = clamp(pos.y + dirY * step, minY, maxY);
      if (!blocked(pos.x, tryY, obstacleList)) pos.y = tryY;
      return true;
    }

    let raf = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      const progress = getScrollProgress();
      const scrollChanged = Math.abs(progress - lastProgress) > 0.0015;
      lastProgress = progress;

      let dx = 0;
      let dy = 0;
      if (keysDown.has("ArrowLeft")) dx -= 1;
      if (keysDown.has("ArrowRight")) dx += 1;
      if (keysDown.has("ArrowUp")) dy -= 1;
      if (keysDown.has("ArrowDown")) dy += 1;
      const keysActive = dx !== 0 || dy !== 0;

      if (keysActive) {
        mode = "keys";
        lastInteraction = now;
      } else if (scrollChanged) {
        mode = "scroll";
        lastInteraction = now;
      } else if (mode !== "routine" && now - lastInteraction < RESUME_DELAY_MS) {
        // keep whichever interactive mode we were in — just idling/settling
      } else {
        if (mode !== "routine") {
          homing = true; // just dropped out of interactive control — walk home first
        }
        mode = "routine";
      }

      let moving = false;

      if (mode === "keys") {
        if (keysActive) {
          const len = Math.hypot(dx, dy) || 1;
          moving = stepToward({ x: pos.x + (dx / len) * 2, y: pos.y + (dy / len) * 2 }, INTERACTIVE_SPEED, dt);
        }
      } else if (mode === "scroll") {
        // Get onto the path first — only once it's standing there does
        // scroll move it along the path's length, rather than cutting a
        // diagonal straight toward the mapped point. Aims at `home`
        // itself (not just sideways at the current height) since that's
        // a point already known to sit cleanly on the path; a
        // same-height-only move can stall if that height happens to
        // intersect an obstacle (e.g. interrupted mid-watering beside
        // the billboard's flower boxes) with no vertical room to slide
        // past it.
        const onPath = Math.abs(pos.x - pathX) < 0.05;
        if (!onPath) {
          moving = stepToward(home, INTERACTIVE_SPEED, dt);
        } else {
          moving = stepToward({ x: pathX, y: home.y + (pathFarRow - home.y) * progress }, INTERACTIVE_SPEED, dt);
        }
      } else if (homing) {
        moving = stepToward(home, ROUTINE_WALK_SPEED, dt);
        if (!moving) {
          homing = false;
          phaseIndex = 0;
          phaseStart = now;
        }
      } else if (enableRoutine) {
        let phase = phases[phaseIndex];
        let elapsed = now - phaseStart;
        while (elapsed >= phase.durationMs) {
          elapsed -= phase.durationMs;
          phaseIndex = (phaseIndex + 1) % phases.length;
          phaseStart = now - elapsed;
          phase = phases[phaseIndex];
        }
        const t = Math.min(1, elapsed / phase.durationMs);
        pos.x = phase.from.x + (phase.to.x - phase.from.x) * t;
        pos.y = phase.from.y + (phase.to.y - phase.from.y) * t;
        setPose({ x: pos.x, y: pos.y, sheet: phase.sheet, row: phase.row, col: Math.floor(elapsed / phase.frameMs) % phase.frameCount });
        raf = requestAnimationFrame(tick);
        return;
      }
      // enableRoutine === false: just stay idle at `home` once arrived.

      if (moving) {
        setPose({ x: pos.x, y: pos.y, sheet: "bunnyRun", row: directionRow[facing], col: Math.floor(now / RUN_FRAME_MS) % 8 });
      } else {
        setPose({ x: pos.x, y: pos.y, sheet: "bunnyIdle", row: directionRow[facing], col: Math.floor(now / IDLE_FRAME_MS) % 5 });
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [home, sign, path, bounds, obstacles]);

  return (
    <Sprite
      sheet={sheets[pose.sheet]}
      col={pose.col}
      row={pose.row}
      alt="Bunny pottering around the yard"
      className="absolute top-0 left-0"
      style={{
        transform: `translate(calc(${pose.x} * var(--px) * 16px), calc(${pose.y} * var(--px) * 16px))`,
      }}
    />
  );
}
