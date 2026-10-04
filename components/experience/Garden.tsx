import { experience } from "@/content/site";
import { GardenPlot } from "@/components/experience/GardenPlot";
import { GardenTrack } from "@/components/experience/GardenTrack";
import { GardenBunny } from "@/components/experience/GardenBunny";
import { GardenAlign } from "@/components/experience/GardenAlign";

/**
 * The Experience section: the landing path continues straight down into
 * a fenced garden, one plot per role (newest first), each growing that
 * role's crop at a stage set by how long ago the role was (see
 * GardenPlot). The "Experience" heading (see GardenSignpost) sits
 * beside the path at the top, like the landing scene's "About me" sign
 * sits beside its path, rather than spanning across and over it — the
 * path itself needs to stay unbroken and fully visible from the top of
 * this section all the way down, so nothing ever sits on top of it.
 *
 * Lining this section's own path/signpost up with where LandingScene's
 * path actually ends — both vertically and horizontally — is handled at
 * runtime by GardenAlign, not with a hand-derived CSS constant: measured
 * via two self-measurement attempts at this (one assuming a fixed
 * vertical row shortfall, another adding a fixed per-tier horizontal
 * shift) both turned out to only hold at some viewport widths and not
 * others — LandingScene's path position relative to its own canvas, and
 * GardenList's track relative to its container, both move independently
 * as the viewport resizes, not in lockstep with any one breakpoint. See
 * GardenAlign's doc for why measuring the real rendered positions is the
 * only thing that actually stays correct everywhere.
 *
 * Two layouts share the same plot/track components and switch with
 * Tailwind display classes — the same "render every tier, toggle
 * visibility" pattern LandingScene uses for its breakpoints, rather
 * than LandingScene's per-tier absolute canvases: this section is
 * normal document flow, so its own grid can just reflow at any width
 * instead of needing a hand-tuned TileCoord map per breakpoint.
 */
export function Garden() {
  return (
    <section
      id="experience"
      className="relative w-full scroll-mt-16 px-4 pt-2 pb-12 sm:px-6 md:pb-16 lg:scroll-mt-20"
      style={{ backgroundColor: "var(--color-grass)" }}
    >
      <GardenZigzag />
      <GardenList />
      <GardenBunny />
      <GardenAlign />
    </section>
  );
}

/**
 * The "Experience" heading, styled like the landing scene's "About me"
 * billboard (see Billboard.tsx) — a parchment board on two support
 * posts — so it reads as the same kind of trailside sign, just planted
 * on this path instead of that one.
 */
function GardenSignpost() {
  return (
    <div className="mx-auto flex w-32 flex-col items-center sm:w-40">
      <div
        className="w-full rounded-[3px] border-[4px] px-3 py-2 text-center"
        style={{ borderColor: "#494040", backgroundColor: "#f3e2c2", boxShadow: "inset 0 0 0 3px #c99b66" }}
      >
        <h2 className="font-[family-name:var(--font-pixel)] text-sm text-[#7d4b33] sm:text-base">
          Experience
        </h2>
      </div>
      <div className="flex w-full justify-between px-3" aria-hidden>
        <div className="h-6 w-[7px]" style={{ backgroundColor: "#6b4530" }} />
        <div className="h-6 w-[7px]" style={{ backgroundColor: "#6b4530" }} />
      </div>
    </div>
  );
}

function GardenZigzag() {
  const rows = experience.length + 1; // +1 for the signpost's own row
  return (
    <ol data-garden-grid className="garden-zigzag mx-auto hidden max-w-4xl lg:grid" aria-label="Work experience">
      <GardenTrack gridColumn={2} rows={rows} />
      <li className="list-none self-center justify-self-start" style={{ gridRow: 1, gridColumn: 1 }}>
        <GardenSignpost />
      </li>
      {experience.map((role, i) => (
        <GardenPlot
          key={role.id}
          role={role}
          stage={i}
          flip={i % 2 === 0}
          showSpur
          style={{
            gridRow: i + 2,
            gridColumn: i % 2 === 0 ? 1 : 3,
            justifySelf: i % 2 === 0 ? "end" : "start",
          }}
        />
      ))}
    </ol>
  );
}

function GardenList() {
  const rows = experience.length + 1;
  return (
    <ol data-garden-grid className="garden-list mx-auto grid max-w-lg lg:hidden" aria-label="Work experience">
      <GardenTrack gridColumn={1} rows={rows} />
      <li className="list-none self-center" style={{ gridRow: 1, gridColumn: 2 }}>
        <GardenSignpost />
      </li>
      {experience.map((role, i) => (
        <GardenPlot key={role.id} role={role} stage={i} style={{ gridRow: i + 2, gridColumn: 2 }} />
      ))}
    </ol>
  );
}
