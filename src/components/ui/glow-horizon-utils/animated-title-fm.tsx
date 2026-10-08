"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, ShieldCheck } from "lucide-react";

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
      className={`relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto ${className}`}
    >
      {/* Subtitle Badge: Arcfield Systems */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-none text-zinc-300 text-xs font-mono uppercase tracking-widest shadow-xs mb-5"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Arcfield Systems</span>
        <span className="text-zinc-600">·</span>
        <span className="text-zinc-400">Institutional Registry</span>
      </motion.div>

      {/* Main Title: SMS */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.4 }}
        className="space-y-2"
      >
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-400 font-sans select-none drop-shadow-sm">
          SMS
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-zinc-400 font-medium tracking-tight max-w-lg mx-auto">
          Next-generation Student Management System with zero-trust security and sub-millisecond querying.
        </p>
      </motion.div>

      {/* Trust & Spec Markers */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.6 }}
        className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs text-zinc-400 font-mono"
      >
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Audit-Verified</span>
        </div>
        <span className="text-zinc-700">·</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>Turbopack Engine</span>
        </div>
        <span className="text-zinc-700">·</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span>120 FPS Compositor</span>
        </div>
      </motion.div>

      {/* Interactive Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.8 }}
        className="flex flex-wrap items-center justify-center gap-3 mt-8"
      >
        <button
          type="button"
          onClick={onExploreClick}
          className="tap-target group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-100 shadow-lg shadow-white/5 cursor-pointer transition-all active:scale-[0.98]"
        >
          <span>Access Student Directory</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {onEnrollClick && (
          <button
            type="button"
            onClick={onEnrollClick}
            className="tap-target inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white font-medium text-xs shadow-xs cursor-pointer transition-all active:scale-[0.98]"
          >
            <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
            <span>Enroll Candidate</span>
          </button>
        )}
      </motion.div>
    </div>
  );
}
