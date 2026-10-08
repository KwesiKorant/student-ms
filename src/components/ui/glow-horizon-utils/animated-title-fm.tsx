"use client";

import * as React from "react";
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
      {/* Subtitle Badge: Arcfield Systems */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/5 text-zinc-700 dark:text-zinc-300 text-xs font-mono uppercase tracking-widest shadow-xs mb-6 select-none"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-semibold">Arcfield Systems</span>
        <span className="text-zinc-400 dark:text-zinc-600">·</span>
        <span className="text-zinc-500 dark:text-zinc-400">Institutional Registry</span>
      </motion.div>

      {/* Main Title: SMS */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
        className="space-y-3"
      >
        <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-950 via-zinc-800 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-500 font-sans select-none leading-none">
          SMS
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-zinc-600 dark:text-zinc-400 font-medium tracking-tight max-w-md mx-auto leading-relaxed">
          Institutional Academic Lifecycle & Student Management System.
        </p>
      </motion.div>

      {/* The 2 Primary Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.55 }}
        className="flex flex-wrap items-center justify-center gap-3 mt-8"
      >
        <button
          type="button"
          onClick={onExploreClick}
          className="tap-target group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-medium text-xs shadow-lg shadow-black/5 dark:shadow-white/5 cursor-pointer transition-all active:scale-[0.98]"
        >
          <span>Access Student Directory</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {onEnrollClick && (
          <button
            type="button"
            onClick={onEnrollClick}
            className="tap-target inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200/90 dark:border-white/15 bg-white dark:bg-white/5 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/10 font-medium text-xs shadow-xs cursor-pointer transition-all active:scale-[0.98]"
          >
            <GraduationCap className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Enroll Candidate</span>
          </button>
        )}
      </motion.div>
    </div>
  );
}
