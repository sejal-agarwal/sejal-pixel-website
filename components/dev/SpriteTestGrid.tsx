import { Sprite } from "@/components/sprite/Sprite";
import { AnimatedSprite } from "@/components/sprite/AnimatedSprite";
import { sheets, directionRow, type Direction } from "@/lib/sprites";

const directions: Direction[] = ["up", "down", "left", "right"];

/**
 * TEMPORARY — CP2 checkpoint only. Proves the sprite engine (crisp
 * scaling at every breakpoint, smooth animation, correct direction rows)
 * before the real scene is composed in CP3/CP4. Delete this file and its
 * import in app/page.tsx at CP8.
 */
export function SpriteTestGrid() {
  return (
    <section className="flex flex-col items-center gap-8 px-6 py-12">
      <h2 className="font-[family-name:var(--font-pixel)] text-[18px]">
        CP2 sprite test grid
      </h2>

      <div>
        <p className="mb-2 text-center text-sm font-semibold">
          Bunny idle (5 frames, ~6fps)
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          {directions.map((dir) => (
            <div key={dir} className="flex flex-col items-center gap-1">
              <AnimatedSprite
                sheet={sheets.bunnyIdle}
                row={directionRow[dir]}
                fps={6}
                alt={`Bunny idling, facing ${dir}`}
              />
              <span className="text-xs uppercase tracking-wide text-[var(--color-ink)]/60">
                {dir}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-center text-sm font-semibold">
          Bunny run (8 frames, ~10fps)
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          {directions.map((dir) => (
            <div key={dir} className="flex flex-col items-center gap-1">
              <AnimatedSprite
                sheet={sheets.bunnyRun}
                row={directionRow[dir]}
                fps={10}
                alt={`Bunny running, facing ${dir}`}
              />
              <span className="text-xs uppercase tracking-wide text-[var(--color-ink)]/60">
                {dir}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-center gap-10">
        <div className="flex flex-col items-center gap-1">
          <AnimatedSprite
            sheet={sheets.campfire}
            fps={8}
            alt="Animated campfire"
          />
          <span className="text-xs uppercase tracking-wide text-[var(--color-ink)]/60">
            campfire
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <AnimatedSprite
            sheet={sheets.chest}
            row={0}
            fps={6}
            alt="Chest opening animation, light oak"
          />
          <span className="text-xs uppercase tracking-wide text-[var(--color-ink)]/60">
            chest (light)
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <Sprite
            sheet={sheets.chest}
            col={0}
            row={1}
            alt="Chest, closed, dark walnut"
          />
          <span className="text-xs uppercase tracking-wide text-[var(--color-ink)]/60">
            chest (dark, static frame 0)
          </span>
        </div>
      </div>
    </section>
  );
}
