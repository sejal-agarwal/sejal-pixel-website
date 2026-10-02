import type { CSSProperties } from "react";
import { site } from "@/content/site";

const TILE = 16;

/**
 * A large roadside billboard standing where the left-hand tree used to
 * be — two support posts holding up a wide board with the full intro
 * blurb (the same text the old cream hero section used to carry, see
 * site.intro). Positioned in landingMap.ts so its posts plant at the
 * same ground line as the house's base.
 */
export function Billboard({ x, y, width }: { x: number; y: number; width: number }) {
  const style: CSSProperties = {
    transform: `translate(calc(${x} * var(--px) * ${TILE}px), calc(${y} * var(--px) * ${TILE}px))`,
    width: `calc(${width} * var(--px) * ${TILE}px)`,
  };

  return (
    <div className="absolute top-0 left-0 flex flex-col items-center" style={style}>
      <div
        className="w-full rounded-[3px] border-[4px] px-3 py-2.5 text-center"
        style={{
          borderColor: "#494040",
          backgroundColor: "#f3e2c2",
          boxShadow: "inset 0 0 0 3px #c99b66",
        }}
      >
        <p className="mb-1.5 font-[family-name:var(--font-pixel)] text-sm text-[#7d4b33] sm:text-base">
          About me
        </p>
        <p className="font-[family-name:var(--font-body)] text-sm leading-snug font-semibold text-[#4a3826] sm:text-base">
          {site.intro}
        </p>
      </div>
      <div className="flex w-full justify-between px-3" aria-hidden>
        <div className="h-6 w-[7px]" style={{ backgroundColor: "#6b4530" }} />
        <div className="h-6 w-[7px]" style={{ backgroundColor: "#6b4530" }} />
      </div>
    </div>
  );
}
