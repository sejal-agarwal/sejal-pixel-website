"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Sprite } from "./Sprite";
import type { SpriteSheet } from "@/lib/sprites";

type AnimatedSpriteProps = {
  sheet: SpriteSheet;
  /** Which row of the sheet to animate along (e.g. a direction). */
  row?: number;
  /**
   * Cycle through several rows in sequence instead of one (e.g. a
   * watering-can animation that faces right, then left, to reach
   * planters on both sides) — each row plays its full `frameCount`
   * before advancing to the next, then loops back to the first.
   * Overrides `row` when given.
   */
  rows?: number[];
  /** Frames to cycle through per row, starting at column 0. Defaults to the whole row. */
  frameCount?: number;
  fps?: number;
  className?: string;
  style?: CSSProperties;
  alt?: string;
  /** Pauses on the first frame when false. Default true. */
  playing?: boolean;
};

/**
 * Loops through the columns of a sprite row (or, with `rows`, through
 * several rows in sequence) using requestAnimationFrame, so the frame
 * rate stays independent of `--px` and works the same in every browser.
 * Respects prefers-reduced-motion by freezing on frame 0.
 */
export function AnimatedSprite({
  sheet,
  row = 0,
  rows,
  frameCount,
  fps = 8,
  className,
  style,
  alt,
  playing = true,
}: AnimatedSpriteProps) {
  const perRowCount = frameCount ?? sheet.cols;
  const rowSequence = rows ?? [row];
  const totalCount = perRowCount * rowSequence.length;
  const [globalFrame, setGlobalFrame] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);

  useEffect(() => {
    if (!playing || totalCount <= 1) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const frameDuration = 1000 / fps;
    lastTickRef.current = performance.now();

    const tick = (now: number) => {
      if (now - lastTickRef.current >= frameDuration) {
        lastTickRef.current = now;
        setGlobalFrame((f) => (f + 1) % totalCount);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, fps, totalCount]);

  const currentRow = rowSequence[Math.floor(globalFrame / perRowCount)];
  const col = globalFrame % perRowCount;

  return (
    <Sprite sheet={sheet} col={col} row={currentRow} className={className} style={style} alt={alt} />
  );
}
