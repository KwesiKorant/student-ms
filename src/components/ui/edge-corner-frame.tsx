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
      className={`edge-corner-frame group relative p-6 sm:p-10 rounded-3xl transition-colors duration-200 ${className}`}
    >
      {/* 4 Softly Diffused Ambient Corner Shadows */}
      <div
        className={`edge-corner-shadow edge-corner-tl transition-opacity duration-300 rounded-tl-3xl ${
          isFocused ? "opacity-100" : "opacity-80 group-hover:opacity-100"
        }`}
        aria-hidden="true"
      />
      <div
        className={`edge-corner-shadow edge-corner-tr transition-opacity duration-300 rounded-tr-3xl ${
          isFocused ? "opacity-100" : "opacity-80 group-hover:opacity-100"
        }`}
        aria-hidden="true"
      />
      <div
        className={`edge-corner-shadow edge-corner-bl transition-opacity duration-300 rounded-bl-3xl ${
          isFocused ? "opacity-100" : "opacity-80 group-hover:opacity-100"
        }`}
        aria-hidden="true"
      />
      <div
        className={`edge-corner-shadow edge-corner-br transition-opacity duration-300 rounded-br-3xl ${
          isFocused ? "opacity-100" : "opacity-80 group-hover:opacity-100"
        }`}
        aria-hidden="true"
      />

      {/* Soft Borderless Surface Depth with Generous Non-Sharp Curvature */}
      <div
        className="absolute inset-0 rounded-3xl bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-white/5 backdrop-blur-xl shadow-xl shadow-zinc-900/5 dark:shadow-black/20 -z-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* Floating Interactive Canvas */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
