import type { CSSProperties } from "react";
import { Sprite } from "@/components/sprite/Sprite";
import { cropSheet } from "@/lib/sprites";
import type { Role } from "@/content/site";
import { CompanyLogo } from "@/components/experience/CompanyLogo";
import { GardenSpur } from "@/components/experience/GardenSpur";

/**
 * One role: a parchment sign with the logo, title, company,
 * location/dates, and a single-sentence summary (the full resume
 * bullets read as too dense for a scannable page — see Role.summary),
 * sitting above the tilled soil bed it describes. The soil bed grows
 * that role's crop (see Role.crop) at a growth stage set by how recent
 * the role is — `stage` 0 (just planted) for the newest role up to 5
 * (fully ripe) for the oldest, see Garden.tsx.
 *
 * The soil bed carries `data-garden-soil` and its crops the
 * `garden-crop` class so GardenBunny (a client component) can find and
 * animate them without this component itself needing to be a client
 * component.
 */
export function GardenPlot({
  role,
  stage,
  style,
  flip = false,
  showSpur = false,
}: {
  role: Role;
  stage: number;
  /** Grid placement, set by the caller (see Garden.tsx's zigzag/list layouts). */
  style?: CSSProperties;
  /**
   * Mirrors the soil bed/card order (sm+ only) so the soil bed — where
   * the spur below attaches — faces the main path instead of always
   * sitting on the same side. Set for the zigzag layout's left-column
   * plots, whose path is to their right (see Garden.tsx).
   */
  flip?: boolean;
  /**
   * Renders a short branch path off the soil bed toward the main
   * trunk (lg+ only) — only the zigzag layout has room for this; the
   * single-column list layout sits right against the path already.
   */
  showSpur?: boolean;
}) {
  const sheet = cropSheet(role.crop, stage);
  const dates = role.dateRanges
    ? role.dateRanges.join(" & ")
    : role.end === "Present"
      ? `${role.start} – Present`
      : `${role.start} – ${role.end}`;

  return (
    <li
      className={`flex list-none flex-col items-center gap-3${flip ? " lg:items-end" : " lg:items-start"}`}
      style={style}
    >
      <div
        className="w-full max-w-sm rounded-[3px] border-[4px] px-3 py-2"
        style={{ borderColor: "#494040", backgroundColor: "#f3e2c2", boxShadow: "inset 0 0 0 3px #c99b66" }}
      >
        <div className="flex items-start gap-2.5">
          <CompanyLogo src={role.logo} alt="" initial={role.company[0]} />
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-pixel)] text-sm text-[#7d4b33] sm:text-base">
              {role.title}
            </p>
            <p className="text-sm font-semibold text-[#4a3826]">
              {role.company} · {role.location}
            </p>
            <p className="text-xs text-[#6b5540]">{dates}</p>
          </div>
        </div>

        <p className="mt-1.5 text-sm leading-snug text-[#4a3826]">{role.summary}</p>
      </div>

      <div
        aria-hidden
        data-garden-soil={role.id}
        className="relative flex h-16 w-20 shrink-0 items-end justify-center gap-2 rounded-[6px] pb-1.5"
        style={{ backgroundColor: "#8e5a3b", boxShadow: "inset 0 0 0 2px #6b4530" }}
      >
        <Sprite sheet={sheet} col={0} className="garden-crop" />
        <Sprite sheet={sheet} col={0} className="garden-crop" />
        {showSpur && <GardenSpur side={flip ? "right" : "left"} />}
      </div>
    </li>
  );
}
