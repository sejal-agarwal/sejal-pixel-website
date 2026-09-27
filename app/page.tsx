import { site } from "@/content/site";
import { SpriteTestGrid } from "@/components/dev/SpriteTestGrid";

// Temporary CP1 placeholder — confirms fonts, Tailwind, and the build
// pipeline work end to end. Replaced by the real landing scene in later
// checkpoints (CP2+).
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-[family-name:var(--font-pixel)] text-[27px] leading-relaxed sm:text-[36px]">
        {site.name}
      </h1>
      <p className="max-w-md font-[family-name:var(--font-body)] text-base text-[var(--color-ink)]/80">
        {site.intro}
      </p>
      <p className="mt-8 font-[family-name:var(--font-pixel)] text-[9px] leading-relaxed text-[var(--color-ink)]/50">
        landing scene coming in the next checkpoint
      </p>

      <SpriteTestGrid />
    </main>
  );
}
