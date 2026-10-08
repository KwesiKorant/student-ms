"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GlowHorizonFM from "@/components/ui/glow-horizon";
import { AnimatedTitleFM } from "@/components/ui/glow-horizon-utils/animated-title-fm";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col justify-between bg-zinc-50 dark:bg-[#050507] text-zinc-900 dark:text-zinc-100 transition-colors duration-200 relative select-none">
      {/* Top Institutional Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/60 dark:border-white/5 bg-zinc-50/80 dark:bg-[#050507]/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-7 h-7 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-mono font-bold text-xs flex items-center justify-center shadow-xs">
              A
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <span className="font-semibold text-zinc-900 dark:text-white tracking-tight">ARCFIELD</span>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="text-zinc-500 dark:text-zinc-400">Registry</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="tap-target inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-xs"
            >
              <span>Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Visual Central Core: Glow Horizon + SMS + Arcfield Systems + Sub + 2 Buttons */}
      <main className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
        {/* Theme-Adaptive Black & White Horizon Glow */}
        <GlowHorizonFM variant="top" />

        {/* Central Titles & Triggers */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center py-6">
          <AnimatedTitleFM
            open={true}
            onExploreClick={() => router.push("/")}
            onEnrollClick={() => router.push("/?enroll=true")}
          />
        </div>
      </main>

      {/* Clean Single-Line Bottom Minimalist Anchor */}
      <footer className="z-10 py-3 text-center text-[11px] font-mono text-zinc-400 dark:text-zinc-600 border-t border-zinc-200/50 dark:border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <span>ARCFIELD SYSTEMS</span>
          <span>STUDENT MANAGEMENT SYSTEM</span>
        </div>
      </footer>
    </div>
  );
}
