"use client";

import { useLayoutEffect } from "react";

/**
 * Lines this section's own path up with where LandingScene's path
 * actually ends, by measuring both at runtime instead of guessing a
 * fixed CSS offset. Two earlier attempts at a hand-derived constant each
 * looked right at the one viewport width they were checked against and
 * broke at others:
 *
 * - A fixed `-3 tile rows` vertical margin assumed LandingScene's path
 *   stops the same distance short of its canvas on every tier. True for
 *   the row count, but says nothing about horizontal position.
 * - A fixed per-breakpoint horizontal shift assumed the landing path's
 *   offset from its own canvas center was the only thing that moved.
 *   It isn't: GardenList's own track hugs the left edge of its
 *   container rather than sitting at that container's center, so its
 *   un-shifted position already moves independently of the landing
 *   path's as the container's max-width clamps against the viewport —
 *   two things drifting against each other, not one fixed to the other.
 *
 * Measuring both elements' actual rendered rects sidesteps all of that:
 * whatever either one's position resolves to at a given width, this
 * just asks for the real numbers and closes the gap between them.
 *
 * `data-landing-path-end` (see LandingScene's SceneCanvas) marks exactly
 * where the currently-visible tier's path stops. `data-garden-grid`
 * marks the currently-visible zigzag/list wrapper (see Garden.tsx) —
 * its own unshifted position is read fresh each time by clearing any
 * previous correction before measuring, so corrections never compound.
 */
export function GardenAlign() {
  useLayoutEffect(() => {
    function visible<T extends HTMLElement>(selector: string) {
      return Array.from(document.querySelectorAll<T>(selector)).find((el) => el.offsetParent !== null) ?? null;
    }

    function align() {
      const grid = visible<HTMLElement>("[data-garden-grid]");
      const track = visible<HTMLElement>("[data-garden-track]");
      const pathEnd = visible<HTMLElement>("[data-landing-path-end]");
      const section = document.getElementById("experience");
      if (!grid || !track || !pathEnd || !section) return;

      // Clear previous corrections before measuring fresh — otherwise
      // the old correction would shift where we measure these at.
      grid.style.transform = "";
      section.style.marginTop = "";

      const pathRect = pathEnd.getBoundingClientRect();
      const trackRect = track.getBoundingClientRect();
      const targetX = pathRect.left + pathRect.width / 2;
      const targetY = pathRect.bottom;
      const currentX = trackRect.left + trackRect.width / 2;
      const currentY = trackRect.top;

      // X: a horizontal nudge on the grid itself (doesn't affect layout
      // flow, so nothing below it needs to move).
      grid.style.transform = `translateX(${targetX - currentX}px)`;
      // Y: a real margin, not a transform — this one does need to pull
      // the whole section (and everything after it) up to close the
      // gap, not just shift pixels while leaving a blank space behind.
      section.style.marginTop = `${targetY - currentY}px`;
    }

    align();
    // Catches viewport resizes directly, and — via observing the whole
    // document — anything that reflows the page without one (a web font
    // swapping in and rewrapping a card's text, an image finishing load
    // and pushing content down), which a resize listener alone would
    // miss.
    window.addEventListener("resize", align);
    const observer = new ResizeObserver(align);
    observer.observe(document.body);
    return () => {
      window.removeEventListener("resize", align);
      observer.disconnect();
    };
  }, []);

  return null;
}
