"use client";

import * as React from "react";

interface EdgeCornerFrameProps {
  children: React.ReactNode;
  className?: string;
  isFocused?: boolean;
}

/**
 * Optical Edge Corner Frame
 * Cardless architecture that frames interaction zones using pre-rendered
 * radial edge-corner shadows and precision architectural corner brackets,
 * creating an unmistakable dimensional card illusion without boxed borders.
 */
export function EdgeCornerFrame({
  children,
  className = "",
  isFocused = false,
}: EdgeCornerFrameProps) {
  return (
    <div
      className={`edge-corner-frame group relative p-6 sm:p-10 transition-colors duration-200 ${className}`}
    >
      {/* 4 Optical Edge Corner Shadows (Rich graphite in light, specular/occlusion in dark) */}
      <div
        className={`edge-corner-shadow edge-corner-tl transition-opacity duration-300 ${
          isFocused ? "opacity-100" : "opacity-85 group-hover:opacity-100"
        }`}
        aria-hidden="true"
      />
      <div
        className={`edge-corner-shadow edge-corner-tr transition-opacity duration-300 ${
          isFocused ? "opacity-100" : "opacity-85 group-hover:opacity-100"
        }`}
        aria-hidden="true"
      />
      <div
        className={`edge-corner-shadow edge-corner-bl transition-opacity duration-300 ${
          isFocused ? "opacity-100" : "opacity-85 group-hover:opacity-100"
        }`}
        aria-hidden="true"
      />
      <div
        className={`edge-corner-shadow edge-corner-br transition-opacity duration-300 ${
          isFocused ? "opacity-100" : "opacity-85 group-hover:opacity-100"
        }`}
        aria-hidden="true"
      />

      {/* 4 Architectural Corner Brackets (2px rounded hairline definition) */}
      <div
        className="edge-corner-bracket top-0 left-0 border-t-2 border-l-2 rounded-tl-lg border-zinc-500/70 dark:border-zinc-300/80 drop-shadow-xs"
        aria-hidden="true"
      />
      <div
        className="edge-corner-bracket top-0 right-0 border-t-2 border-r-2 rounded-tr-lg border-zinc-500/70 dark:border-zinc-300/80 drop-shadow-xs"
        aria-hidden="true"
      />
      <div
        className="edge-corner-bracket bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg border-zinc-500/70 dark:border-zinc-300/80 drop-shadow-xs"
        aria-hidden="true"
      />
      <div
        className="edge-corner-bracket bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg border-zinc-500/70 dark:border-zinc-300/80 drop-shadow-xs"
        aria-hidden="true"
      />

      {/* Subtle Borderless Surface Depth (Elevated without a card border) */}
      <div
        className="absolute inset-0 rounded-2xl bg-white/40 dark:bg-zinc-900/30 -z-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* Floating Interactive Canvas */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
