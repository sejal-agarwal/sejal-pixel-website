"use client";

import { useEffect, useRef, useState } from "react";
import { Sprite } from "@/components/sprite/Sprite";
import { sheets } from "@/lib/sprites";

const TILE = 16;

type Point = { x: number; y: number };
type BunnySheet = "bunnyIdle" | "bunnyRun" | "bunnyWatering";

/**
 * A small scripted loop, used on every side-by-side billboard+house tier
 * (desktop and both tablet tiers — see LandingScene; the stacked mobile
 * layout uses a plain idle DecorItem instead, since home/sign share a y
 * that only holds for those three): the bunny idles by the door, walks
 * over to the billboard and waters the flowers by its posts, then walks
 * back and idles again. Built as its own timer-driven component (rather
 * than a static DecorItem) since it's the only thing on the page whose
 * position — not just its animation frame — changes over time.
 *
 * `home` and `sign` are both in tile units, same as DecorItem, and are
 * assumed to share a y (a level walk) — see the coordinates in
 * landingMap.ts.
 */
// How long each leg of the loop takes. Durations in ms; walking speed in
// tiles/sec (the walk legs' durations follow from that and the distance
// between `home` and `sign`, below).
const IDLE_HOME_MS = 9000;
const WATER_MS = 3000; // one 9-frame loop, repeated, facing right
const WALK_TILES_PER_SEC = 3;

export function BunnyRoutine({ home, sign }: { home: Point; sign: Point }) {
  const [pose, setPose] = useState<{ x: number; y: number; sheet: BunnySheet; row: number; col: number }>(() => ({
    x: home.x,
    y: home.y,
    sheet: "bunnyIdle",
    row: 3,
    col: 0,
  }));
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotionRef.current) return; // stays on the idle pose set above

    const distance = Math.hypot(home.x - sign.x, home.y - sign.y);
    const walkMs = (distance / WALK_TILES_PER_SEC) * 1000;

    // Each phase: which sprite/row to show, how many columns it cycles
    // through and how fast, how long the phase lasts, and where the
    // bunny stands during it (interpolated from `from` to `to`). The
    // watering stream pours from partway down the sprite's 3-tile
    // frame, past `sign`'s own flowers if the bunny just stood at their
    // height — `sign` is already raised above them to compensate (see
    // landingMap.ts) — and it waters facing right, toward the purple
    // flowerPurple cluster by the near post.
    const phases = [
      { sheet: "bunnyIdle" as const, row: 3, frameCount: 5, frameMs: 1000 / 6, durationMs: IDLE_HOME_MS, from: home, to: home },
      { sheet: "bunnyRun" as const, row: 2, frameCount: 8, frameMs: 1000 / 10, durationMs: walkMs, from: home, to: sign },
      { sheet: "bunnyWatering" as const, row: 1, frameCount: 9, frameMs: 1000 / 6, durationMs: WATER_MS, from: sign, to: sign },
      { sheet: "bunnyRun" as const, row: 1, frameCount: 8, frameMs: 1000 / 10, durationMs: walkMs, from: sign, to: home },
    ];

    let raf = 0;
    let phaseIndex = 0;
    let phaseStart = performance.now();

    const tick = (now: number) => {
      let phase = phases[phaseIndex];
      let elapsed = now - phaseStart;
      while (elapsed >= phase.durationMs) {
        elapsed -= phase.durationMs;
        phaseIndex = (phaseIndex + 1) % phases.length;
        phaseStart = now - elapsed;
        phase = phases[phaseIndex];
      }

      const t = Math.min(1, elapsed / phase.durationMs);
      const x = phase.from.x + (phase.to.x - phase.from.x) * t;
      const y = phase.from.y + (phase.to.y - phase.from.y) * t;
      const col = Math.floor(elapsed / phase.frameMs) % phase.frameCount;

      setPose({ x, y, sheet: phase.sheet, row: phase.row, col });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [home, sign]);

  return (
    <Sprite
      sheet={sheets[pose.sheet]}
      col={pose.col}
      row={pose.row}
      alt="Bunny pottering between the cottage and the sign"
      className="absolute top-0 left-0"
      style={{
        transform: `translate(calc(${pose.x} * var(--px) * ${TILE}px), calc(${pose.y} * var(--px) * ${TILE}px))`,
      }}
    />
  );
}
