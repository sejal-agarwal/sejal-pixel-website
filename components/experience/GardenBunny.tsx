"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Sprite } from "@/components/sprite/Sprite";
import { sheets, directionRow, type Direction } from "@/lib/sprites";

type BunnyState = "idle" | "running" | "watering";
type Pose = {
  x: number;
  y: number;
  visible: boolean;
  state: BunnyState;
  facing: Direction;
  col: number;
  /** How long the current left/top transition should take — see RUN_PX_PER_MS. */
  moveMs: number;
};

const RUN_FRAME_MS = 1000 / 10;
const RUN_FRAME_COUNT = 8;
// A run's duration is proportional to the distance actually covered
// (see activate()), so a hop to the next row and a hop across a wide
// viewport both read as running at the same speed, instead of every
// hop sliding over in a fixed window regardless of how far it is —
// that's what made long hops look like a teleport/jump rather than a
// run. Clamped so a tiny hop doesn't flash by in a few ms and a huge
// one doesn't crawl forever.
const RUN_PX_PER_MS = 0.6;
const MIN_RUN_MS = 220;
const MAX_RUN_MS = 1400;
const WATER_FRAME_MS = 1000 / 6;
const WATER_FRAME_COUNT = 9;
const WATER_DURATION_MS = WATER_FRAME_MS * WATER_FRAME_COUNT; // one loop
const IDLE_FRAME_MS = 1000 / 6;
const IDLE_FRAME_COUNT = 5;
// How far into the watering loop the plot's crops pop up — partway
// through, not at the very start, so it reads as the watering causing
// the growth rather than them appearing independently.
const GROW_DELAY_MS = 500;
// A thin band near the vertical center of the viewport — whichever
// plot's soil bed is crossing it "becomes" the current one.
const TRIGGER_ROOT_MARGIN = "-45% 0px -45% 0px";
// Matches the zigzag layout's lg breakpoint (see Garden.tsx/globals.css)
// — below it there's no spur, and the soil bed sits directly beside the
// track already.
const ZIGZAG_QUERY = "(min-width: 1024px)";

function runMs(distance: number) {
  return Math.min(MAX_RUN_MS, Math.max(MIN_RUN_MS, Math.round(distance / RUN_PX_PER_MS)));
}

/**
 * An overlay bunny for the Experience garden: runs down the main path
 * to whichever row's plot is nearest the center of the viewport, then
 * — on the zigzag layout (lg+), where each plot's soil bed branches off
 * the trunk via a spur (see GardenSpur) — turns and runs out along that
 * spur to the soil bed's edge, so it actually ends up beside the plot
 * it's watering rather than watering from all the way back at the
 * trunk. Each leg's duration is proportional to the distance it covers
 * (see runMs), so both legs read as running at a steady pace rather
 * than a fixed-time slide that looks like a jump on a long hop.
 *
 * Waters the plot from there the first time it arrives — facing
 * whichever side the soil bed is actually on — popping that plot's
 * crops up (see .garden-crop/.is-seed in globals.css), then idles
 * there (still on the path/spur, never the soil itself) until
 * scrolling brings the next plot into the trigger band.
 *
 * Deliberately a plain DOM query/IntersectionObserver over the
 * already-rendered markup (`data-garden-soil`, see GardenPlot) rather
 * than lifting the garden's plots into client state: the plots stay
 * static server-rendered content, and this is a one-off visual layer on
 * top, the same way a lightbox or a scroll-spy nav highlight would be.
 *
 * Skipped entirely under prefers-reduced-motion — crops render fully
 * grown without it (see globals.css), so there's nothing this adds
 * besides motion.
 */
export function GardenBunny() {
  const [pose, setPose] = useState<Pose>({
    x: 0,
    y: 0,
    visible: false,
    state: "idle",
    facing: "down",
    col: 0,
    moveMs: MIN_RUN_MS,
  });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const container = document.getElementById("experience");
    if (!container) return;

    document.querySelectorAll<HTMLElement>(".garden-crop").forEach((el) => el.classList.add("is-seed"));

    const visited = new Set<HTMLElement>();
    const zigzagQuery = window.matchMedia(ZIGZAG_QUERY);
    let observer: IntersectionObserver | null = null;
    let legTimer: ReturnType<typeof setTimeout> | null = null;
    let waterTimer: ReturnType<typeof setTimeout> | null = null;
    let growTimer: ReturnType<typeof setTimeout> | null = null;
    // Mirrors pose so activate() can read the bunny's current position/
    // facing synchronously (to pick a run-facing direction) without
    // pose itself being a dependency of this mount-once effect — a
    // state read here would otherwise be stale across activations.
    let current = { x: 0, y: 0, facing: "down" as Direction };

    function trackCenterX() {
      const visibleTrack = Array.from(document.querySelectorAll<HTMLElement>("[data-garden-track]")).find(
        (el) => el.offsetParent !== null,
      );
      if (!visibleTrack) return current.x;
      const containerRect = container!.getBoundingClientRect();
      const rect = visibleTrack.getBoundingClientRect();
      return rect.left - containerRect.left + rect.width / 2;
    }

    function settleAtPlot(el: HTMLElement, facingAtPlot: Direction, alreadyVisited: boolean) {
      current.facing = facingAtPlot;
      if (alreadyVisited) {
        setPose((p) => ({ ...p, state: "idle", facing: facingAtPlot }));
        return;
      }
      setPose((p) => ({ ...p, state: "watering", facing: facingAtPlot }));
      growTimer = setTimeout(() => {
        el.querySelectorAll<HTMLElement>(".garden-crop").forEach((crop) => {
          crop.classList.remove("is-seed");
          crop.classList.add("is-grown");
        });
      }, GROW_DELAY_MS);
      waterTimer = setTimeout(() => {
        setPose((p) => ({ ...p, state: "idle" }));
      }, WATER_DURATION_MS);
    }

    function activate(el: HTMLElement) {
      const containerRect = container!.getBoundingClientRect();
      const soilRect = el.getBoundingClientRect();
      const trackX = trackCenterX();
      const soilLeft = soilRect.left - containerRect.left;
      const soilRight = soilRect.right - containerRect.left;
      const soilCenterX = (soilLeft + soilRight) / 2;
      const y = soilRect.top - containerRect.top + soilRect.height / 2;
      // Which side the soil bed is actually on, so the bunny faces it
      // once it arrives — works for both layouts without needing to
      // know which one is active: in the zigzag it alternates, in the
      // single-column list it's always the same side, and this reads
      // it straight off geometry either way.
      const facingAtPlot: Direction = soilCenterX < trackX ? "left" : "right";
      // On the zigzag layout a spur bridges the trunk to the soil bed's
      // near edge (see GardenSpur/GardenPlot) — that edge is where the
      // bunny should end up, still on path, right beside the crops.
      // Below that breakpoint there's no spur and the soil already
      // sits directly against the track, so the trunk's own center is
      // close enough and is where it stays.
      const hasSpur = zigzagQuery.matches;
      const finalX = hasSpur ? (facingAtPlot === "left" ? soilRight : soilLeft) : trackX;

      if (legTimer) clearTimeout(legTimer);
      if (waterTimer) clearTimeout(waterTimer);
      if (growTimer) clearTimeout(growTimer);

      const alreadyVisited = visited.has(el);
      visited.add(el);

      // Leg 1: run down/up the trunk to this row.
      const leg1Facing: Direction = y === current.y ? current.facing : y > current.y ? "down" : "up";
      const leg1Distance = Math.hypot(trackX - current.x, y - current.y);
      const leg1Ms = runMs(leg1Distance);
      current = { x: trackX, y, facing: leg1Facing };
      setPose({ x: trackX, y, visible: true, state: "running", facing: leg1Facing, col: 0, moveMs: leg1Ms });

      legTimer = setTimeout(() => {
        if (finalX !== trackX) {
          // Leg 2: turn and run out along the spur to the soil's edge.
          const leg2Ms = runMs(Math.abs(finalX - trackX));
          current = { x: finalX, y, facing: facingAtPlot };
          setPose((p) => ({ ...p, x: finalX, facing: facingAtPlot, moveMs: leg2Ms }));
          legTimer = setTimeout(() => settleAtPlot(el, facingAtPlot, alreadyVisited), leg2Ms);
        } else {
          settleAtPlot(el, facingAtPlot, alreadyVisited);
        }
      }, leg1Ms);
    }

    function sync() {
      // Both layouts (zigzag/list — see Garden.tsx) always render; only
      // one is ever actually visible at a given width (the other is
      // `display: none`), and a hidden element's `offsetParent` is
      // always null — a cheap way to tell which copy is live without
      // re-deriving the breakpoint here too.
      const visibleSoils = Array.from(
        document.querySelectorAll<HTMLElement>("[data-garden-soil]"),
      ).filter((el) => el.offsetParent !== null);

      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) activate(entry.target as HTMLElement);
          }
        },
        { rootMargin: TRIGGER_ROOT_MARGIN, threshold: 0 },
      );
      visibleSoils.forEach((el) => observer!.observe(el));
    }

    sync();
    window.addEventListener("resize", sync);

    return () => {
      window.removeEventListener("resize", sync);
      observer?.disconnect();
      if (legTimer) clearTimeout(legTimer);
      if (waterTimer) clearTimeout(waterTimer);
      if (growTimer) clearTimeout(growTimer);
    };
  }, []);

  // Frame-cycling loop for whichever sheet is currently posed.
  useEffect(() => {
    if (!pose.visible) return;
    let raf = 0;
    const start = performance.now();
    const frameMs = pose.state === "watering" ? WATER_FRAME_MS : pose.state === "running" ? RUN_FRAME_MS : IDLE_FRAME_MS;
    const frameCount =
      pose.state === "watering" ? WATER_FRAME_COUNT : pose.state === "running" ? RUN_FRAME_COUNT : IDLE_FRAME_COUNT;
    const tick = (now: number) => {
      const col = Math.floor((now - start) / frameMs) % frameCount;
      setPose((p) => (p.col === col ? p : { ...p, col }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // Re-synced whenever the state (idle/running/watering) changes, not
    // every pose update — restarting `start` on every x/y change would
    // reset the frame cycle mid-hop.
  }, [pose.visible, pose.state]);

  if (!pose.visible) return null;

  const sheet = pose.state === "watering" ? sheets.bunnyWatering : pose.state === "running" ? sheets.bunnyRun : sheets.bunnyIdle;
  // bunnyWatering has the same row order as bunnyIdle (see lib/sprites.ts),
  // so directionRow covers all three sheets.
  const row = directionRow[pose.facing];

  return (
    <Sprite
      sheet={sheet}
      col={pose.col}
      row={row}
      alt="Bunny tending the garden"
      className="pointer-events-none absolute z-30 ease-out"
      style={
        {
          left: pose.x,
          top: pose.y,
          transform: "translate(-50%, -50%)",
          transitionProperty: "left, top",
          transitionDuration: `${pose.moveMs}ms`,
          // Left at the ambient tile scale (see --px in globals.css) on
          // purpose, not shadowed to a smaller fixed value — this bunny
          // should read as the same size as BunnyRoutine's in the
          // landing scene above, not a shrunken copy.
        } as CSSProperties
      }
    />
  );
}
