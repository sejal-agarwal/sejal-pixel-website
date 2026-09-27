"use client";

import { useEffect, useRef, useState } from "react";
import { Sprite } from "./Sprite";
import type { SpriteSheet } from "@/lib/sprites";

type AnimatedSpriteProps = {
  sheet: SpriteSheet;
  /** Which row of the sheet to animate along (e.g. a direction). */
  row?: number;
  /** Frames to cycle through, starting at column 0. Defaults to the whole row. */
  frameCount?: number;
  fps?: number;
  className?: string;
  alt?: string;
  /** Pauses on the first frame when false. Default true. */
  playing?: boolean;
};

/**
 * Loops through the columns of a sprite row using requestAnimationFrame,
 * so the frame rate stays independent of `--px` and works the same in
 * every browser. Respects prefers-reduced-motion by freezing on frame 0.
 */
export function AnimatedSprite({
  sheet,
  row = 0,
  frameCount,
  fps = 8,
  className,
  alt,
  playing = true,
}: AnimatedSpriteProps) {
  const count = frameCount ?? sheet.cols;
  const [frame, setFrame] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);

  useEffect(() => {
    if (!playing || count <= 1) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const frameDuration = 1000 / fps;
    lastTickRef.current = performance.now();

    const tick = (now: number) => {
      if (now - lastTickRef.current >= frameDuration) {
        lastTickRef.current = now;
        setFrame((f) => (f + 1) % count);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, fps, count]);

  return <Sprite sheet={sheet} col={frame} row={row} className={className} alt={alt} />;
}
