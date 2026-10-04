"use client";

import { useEffect, useState } from "react";

type Status = "loading" | "ok" | "error";

/**
 * A role's pixelated company logo (see Role.logo in content/site.ts and
 * scripts/pixelate-logos.py for how it's generated). Falls back to the
 * company's first letter, in the pixel font, until a logo actually
 * exists at that path.
 *
 * Checks the image with a throwaway `Image()` in an effect rather than
 * an `onError` on the rendered `<img>` itself: these logos 404 fast
 * (served straight from /public with nothing to wait on), often fast
 * enough that the browser fires the native `error` event on the
 * server-rendered `<img>` before React finishes hydrating and attaching
 * its listener, so the handler never runs and a broken-image icon gets
 * stuck showing. A fresh `Image()` created after mount always has a
 * listener in place before its own request can resolve, so it can't
 * miss the event the same way.
 */
export function CompanyLogo({ src, alt, initial }: { src: string; alt: string; initial: string }) {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    const probe = new window.Image();
    probe.onload = () => {
      if (!cancelled) setStatus("ok");
    };
    probe.onerror = () => {
      if (!cancelled) setStatus("error");
    };
    probe.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (status !== "ok") {
    return (
      <span
        aria-hidden
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] font-[family-name:var(--font-pixel)] text-sm text-[var(--color-cream)]"
        style={{ backgroundColor: "#7d4b33" }}
      >
        {initial}
      </span>
    );
  }

  return (
    // Small pixel-art logo rendered at native size — next/image's
    // optimizer would blur it, and it's not large enough to matter for LCP.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="pixelated h-8 w-8 shrink-0 object-contain" />
  );
}
