import type { CSSProperties } from "react";
import type { SpriteSheet } from "@/lib/sprites";

type SpriteProps = {
  sheet: SpriteSheet;
  /** Which column (frame) of the sheet to show. */
  col: number;
  /** Which row of the sheet to show (e.g. a direction). */
  row?: number;
  className?: string;
  style?: CSSProperties;
  /** Accessible label. Omit for purely decorative sprites (the default). */
  alt?: string;
};

/**
 * Renders one frame of a sprite sheet at the current `--px` integer scale,
 * via background-position — no image slicing needed. See `.sprite` in
 * globals.css for the scaling math.
 */
export function Sprite({ sheet, col, row = 0, className, style, alt }: SpriteProps) {
  const spriteVars = {
    "--sprite-url": `url(${sheet.src})`,
    "--frame-w": sheet.frameW,
    "--frame-h": sheet.frameH,
    "--sheet-cols": sheet.cols,
    "--sheet-rows": sheet.rows,
    "--frame-col": col,
    "--frame-row": row,
  } as CSSProperties;

  return (
    <div
      role={alt ? "img" : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
      className={`sprite${className ? ` ${className}` : ""}`}
      style={{ ...spriteVars, ...style }}
    />
  );
}
