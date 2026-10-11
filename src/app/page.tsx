"use client";

import * as React from "react";
import Link from "next/link";
import GlowHorizonFM from "@/components/ui/glow-horizon";
import { AnimatedTitleFM } from "@/components/ui/glow-horizon-utils/animated-title-fm";
import { ThemeToggle } from "@/components/theme-toggle";

export default function RootLandingPage() {
  const handleEnrollClick = React.useCallback(() => {
    try {
      sessionStorage.setItem("arcfield_auto_enroll", "true");
    } catch {}
  }, []);

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col justify-between bg-zinc-50 dark:bg-[#050507] text-zinc-900 dark:text-zinc-100 transition-colors duration-200 relative select-none">
      {/* Top Institutional Bar */}
      <header className="sticky top-0 z-40 w-full bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand Identity */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group hover:opacity-85 transition-opacity"
            title="Arcfield Systems"
          >
            <div className="w-7 h-7 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-mono font-bold text-xs flex items-center justify-center shadow-xs">
              A
            </div>
            <span className="font-semibold text-xs tracking-tight text-zinc-900 dark:text-white uppercase">
              ARCFIELD
            </span>
          </Link>

          {/* Right: Theme Controls */}
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Visual Core: Horizon Glow + Titles + Action Triggers */}
      <main className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
        <GlowHorizonFM variant="top" />

        <div className="relative z-10 w-full flex flex-col items-center justify-center py-6">
          <AnimatedTitleFM open={true} onEnrollClick={handleEnrollClick} />
        </div>
      </main>

      {/* Spacing bottom */}
      <div className="h-6 w-full pointer-events-none" />
    </div>
  );
}
