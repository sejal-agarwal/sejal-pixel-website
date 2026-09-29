"use client";

import { useState } from "react";
import { site, navItems } from "@/content/site";

/**
 * A sticky top bar styled like a wooden plank (see .plank-bg in
 * globals.css, colors sampled from the house sprite's wall) — the name
 * on the left, section links on the right. Below the `lg` breakpoint
 * (mobile and tablet, where there isn't room for six links on one line)
 * the links collapse into a hamburger button that opens a dropdown.
 */
export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="plank-bg sticky top-0 z-20 w-full">
      <nav className="flex items-center justify-between gap-4 px-4 py-3">
        <a
          href="#home"
          className="shrink-0 font-[family-name:var(--font-pixel)] text-lg text-[var(--color-cream)] [text-shadow:1px_1px_0_rgb(0_0_0_/_35%)] sm:text-xl"
        >
          {site.name}
        </a>

        <ul className="hidden items-center gap-x-6 gap-y-1 lg:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="text-base font-semibold text-[var(--color-cream)]/90 transition-colors hover:text-[var(--color-cream)]"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          className="flex h-8 w-8 shrink-0 flex-col items-center justify-center gap-1.5 lg:hidden"
        >
          <span
            className={`h-[3px] w-6 bg-[var(--color-cream)] transition-transform ${open ? "translate-y-[7.5px] rotate-45" : ""}`}
          />
          <span
            className={`h-[3px] w-6 bg-[var(--color-cream)] transition-opacity ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`h-[3px] w-6 bg-[var(--color-cream)] transition-transform ${open ? "-translate-y-[7.5px] -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {open && (
        <ul className="plank-bg flex flex-col border-t-[3px] border-[#494040] px-4 py-2 lg:hidden">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="block py-2 text-base font-semibold text-[var(--color-cream)]/90 transition-colors hover:text-[var(--color-cream)]"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
