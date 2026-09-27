import { site } from "@/content/site";
import { SpriteTestGrid } from "@/components/dev/SpriteTestGrid";
import { LandingScene } from "@/components/landing/LandingScene";

// Temporary CP1 placeholder text — confirms fonts, Tailwind, and the build
// pipeline work end to end. Gets folded into the real HeroCard (name,
// intro, socials, resume button) in CP5, overlaid on the scene below.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <h1 className="font-[family-name:var(--font-pixel)] text-[27px] leading-relaxed sm:text-[36px]">
          {site.name}
        </h1>
        <p className="max-w-md font-[family-name:var(--font-body)] text-base text-[var(--color-ink)]/80">
          {site.intro}
        </p>
      </div>

      <LandingScene />

      <div className="flex flex-col items-center gap-8 px-6 py-12 text-center">
        <p className="font-[family-name:var(--font-pixel)] text-[9px] leading-relaxed text-[var(--color-ink)]/50">
          house, trees, and the rest of the scene arrive in the next checkpoint
        </p>

        <SpriteTestGrid />
      </div>
    </main>
  );
}
