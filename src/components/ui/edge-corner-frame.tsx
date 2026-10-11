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
 * completely replacing traditional boxed cards with ethereal dimensional depth.
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
      {/* 4 Optical Edge Corner Radial Shadows (Zero-repaint compositor layers) */}
      <div
        className={`edge-corner-shadow edge-corner-tl transition-opacity duration-300 ${
          isFocused ? "opacity-100" : "opacity-75 group-hover:opacity-100"
        }`}
        aria-hidden="true"
      />
      <div
        className={`edge-corner-shadow edge-corner-tr transition-opacity duration-300 ${
          isFocused ? "opacity-100" : "opacity-75 group-hover:opacity-100"
        }`}
        aria-hidden="true"
      />
      <div
        className={`edge-corner-shadow edge-corner-bl transition-opacity duration-300 ${
          isFocused ? "opacity-100" : "opacity-75 group-hover:opacity-100"
        }`}
        aria-hidden="true"
      />
      <div
        className={`edge-corner-shadow edge-corner-br transition-opacity duration-300 ${
          isFocused ? "opacity-100" : "opacity-75 group-hover:opacity-100"
        }`}
        aria-hidden="true"
      />

      {/* 4 Minimalist Architectural Corner Bracket Accents (1px hairline) */}
      <div
        className="edge-corner-bracket top-0 left-0 border-t border-l border-zinc-400/40 dark:border-zinc-500/50"
        aria-hidden="true"
      />
      <div
        className="edge-corner-bracket top-0 right-0 border-t border-r border-zinc-400/40 dark:border-zinc-500/50"
        aria-hidden="true"
      />
      <div
        className="edge-corner-bracket bottom-0 left-0 border-b border-l border-zinc-400/40 dark:border-zinc-500/50"
        aria-hidden="true"
      />
      <div
        className="edge-corner-bracket bottom-0 right-0 border-b border-r border-zinc-400/40 dark:border-zinc-500/50"
        aria-hidden="true"
      />

      {/* Floating Interactive Canvas */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
