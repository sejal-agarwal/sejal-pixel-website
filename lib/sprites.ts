// Sprite sheet metadata for the Little Dreamyland assets we use.
// Frame sizes/counts were measured directly from the PNGs (see the CP2
// checkpoint notes) rather than assumed, since the pack ships without a
// manifest.

export type SpriteSheet = {
  src: string;
  frameW: number;
  frameH: number;
  cols: number;
  rows: number;
};

export type Direction = "up" | "down" | "left" | "right";

// Row order in the bunny sheets, confirmed against the CP2 test grid
// (row 0 is a back view = "up"; rows 1-3 are front-facing poses — row 1
// reads as "right", row 3 as "down", row 2 as "left").
export const directionRow: Record<Direction, number> = {
  up: 0,
  right: 1,
  left: 2,
  down: 3,
};

export const sheets = {
  bunnyIdle: {
    src: "/sprites/characters/bunny/Bunny_Idle.png",
    frameW: 48,
    frameH: 48,
    cols: 5,
    rows: 4,
  },
  bunnyRun: {
    src: "/sprites/characters/bunny/Bunny_Run.png",
    frameW: 48,
    frameH: 48,
    cols: 8,
    rows: 4,
  },
  campfire: {
    src: "/sprites/objects/Campfire.png",
    frameW: 16,
    frameH: 32,
    cols: 7,
    rows: 1,
  },
  chest: {
    src: "/sprites/objects/Chest.png",
    frameW: 16,
    frameH: 32,
    cols: 7,
    // row 0 = light oak, row 1 = dark walnut. Frames run closed (0-1) ->
    // lid lifting (2-4) -> open (5-6).
    rows: 2,
  },
} as const satisfies Record<string, SpriteSheet>;

export type SheetName = keyof typeof sheets;
