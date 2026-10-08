"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, GraduationCap } from "lucide-react";

interface AnimatedTitleFMProps {
  open?: boolean;
  onExploreClick?: () => void;
  onEnrollClick?: () => void;
  className?: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function AnimatedTitleFM({
  open = true,
  onExploreClick,
  onEnrollClick,
  className = "",
}: AnimatedTitleFMProps) {
  if (!open) return null;

  return (
    <div
      className={`relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-3xl mx-auto ${className}`}
    >
      {/* Main Title: SMS */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
        className="space-y-3"
      >
        <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[10.5rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-950 via-zinc-800 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 font-sans select-none leading-none drop-shadow-sm">
          SMS
        </h1>
        <p className="text-base sm:text-lg md:text-xl font-medium tracking-tight text-zinc-600 dark:text-zinc-400 select-none">
          Student Management System
        </p>
      </motion.div>

      {/* The 2 Primary Action Buttons - placed comfortably below the middle horizon line */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-3.5 mt-24 sm:mt-28 md:mt-32"
      >
        <Link
          href="/"
          onClick={onExploreClick}
          className="tap-target group inline-flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-medium text-xs sm:text-sm shadow-xl shadow-black/15 dark:shadow-white/10 cursor-pointer transition-all active:scale-[0.98]"
        >
          <span>Directory</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href="/?enroll=true"
          onClick={onEnrollClick}
          className="tap-target inline-flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl border border-zinc-300 dark:border-white/20 bg-white/90 dark:bg-white/10 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/15 font-medium text-xs sm:text-sm shadow-sm cursor-pointer transition-all active:scale-[0.98]"
        >
          <GraduationCap className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
          <span>Enroll</span>
        </Link>
      </motion.div>
    </div>
  );
}
