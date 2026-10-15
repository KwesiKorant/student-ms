"use client";

import * as React from "react";

interface EdgeCornerFrameProps {
  children: React.ReactNode;
  className?: string;
  isFocused?: boolean;
}

/**
 * Optical Edge Corner Frame
 * Softly framed dimensional interaction zone with smooth, non-sharp rounded curvature
 * and diffused ambient corner shadows.
 */
export function EdgeCornerFrame({
  children,
  className = "",
  isFocused = false,
}: EdgeCornerFrameProps) {
  return (
    <div
      className={`edge-corner-frame group relative rounded-2xl sm:rounded-3xl p-5 sm:p-10 transition-colors duration-200 ${className}`}
    >
      {/* 4 Optical Edge Corner Shadows (Rich graphite in light, ambient luminescence in dark) */}
      <div
        className={`edge-corner-shadow absolute pointer-events-none edge-corner-tl transition-opacity duration-300 ${
          isFocused ? "opacity-100" : "opacity-85 group-hover:opacity-100"
        }`}
        aria-hidden="true"
      />
      <div
        className={`edge-corner-shadow absolute pointer-events-none edge-corner-tr transition-opacity duration-300 ${
          isFocused ? "opacity-100" : "opacity-85 group-hover:opacity-100"
        }`}
        aria-hidden="true"
      />
      <div
        className={`edge-corner-shadow absolute pointer-events-none edge-corner-bl transition-opacity duration-300 ${
          isFocused ? "opacity-100" : "opacity-85 group-hover:opacity-100"
        }`}
        aria-hidden="true"
      />
      <div
        className={`edge-corner-shadow absolute pointer-events-none edge-corner-br transition-opacity duration-300 ${
          isFocused ? "opacity-100" : "opacity-85 group-hover:opacity-100"
        }`}
        aria-hidden="true"
      />

      {/* 4 Architectural Corner Brackets (Smooth, non-sharp rounded curvature) */}
      <div
        className="absolute pointer-events-none z-10 w-7 h-7 top-0 left-0 border-t-2 border-l-2 rounded-tl-2xl sm:rounded-tl-3xl border-zinc-400/80 dark:border-zinc-400/60 drop-shadow-xs transition-colors duration-200"
        aria-hidden="true"
      />
      <div
        className="absolute pointer-events-none z-10 w-7 h-7 top-0 right-0 border-t-2 border-r-2 rounded-tr-2xl sm:rounded-tr-3xl border-zinc-400/80 dark:border-zinc-400/60 drop-shadow-xs transition-colors duration-200"
        aria-hidden="true"
      />
      <div
        className="absolute pointer-events-none z-10 w-7 h-7 bottom-0 left-0 border-b-2 border-l-2 rounded-bl-2xl sm:rounded-bl-3xl border-zinc-400/80 dark:border-zinc-400/60 drop-shadow-xs transition-colors duration-200"
        aria-hidden="true"
      />
      <div
        className="absolute pointer-events-none z-10 w-7 h-7 bottom-0 right-0 border-b-2 border-r-2 rounded-br-2xl sm:rounded-br-3xl border-zinc-400/80 dark:border-zinc-400/60 drop-shadow-xs transition-colors duration-200"
        aria-hidden="true"
      />

      {/* Unified Perimeter Border with Soft Curve Edges */}
      <div
        className={`absolute inset-0 rounded-2xl sm:rounded-3xl border pointer-events-none transition-colors duration-200 ${
          isFocused
            ? "border-zinc-400 dark:border-white/25"
            : "border-zinc-300/80 dark:border-white/10 group-hover:border-zinc-400/80 dark:group-hover:border-white/20"
        }`}
        aria-hidden="true"
      />

      {/* Floating Interactive Canvas */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
