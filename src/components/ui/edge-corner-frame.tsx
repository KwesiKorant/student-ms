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
      {/* Optical Edge Corner Shadows (Light: 4 corners feathered; Dark: bottom corners only) */}
      <div
        className={`edge-corner-shadow dark:hidden absolute pointer-events-none edge-corner-tl transition-opacity duration-300 ${
          isFocused ? "opacity-100" : "opacity-85 group-hover:opacity-100"
        }`}
        aria-hidden="true"
      />
      <div
        className={`edge-corner-shadow dark:hidden edge-corner-tr absolute pointer-events-none transition-opacity duration-300 ${
          isFocused ? "opacity-100" : "opacity-85 group-hover:opacity-100"
        }`}
        aria-hidden="true"
      />
      <div
        className={`edge-corner-shadow edge-corner-bl absolute pointer-events-none transition-opacity duration-300 ${
          isFocused ? "opacity-100" : "opacity-85 group-hover:opacity-100"
        }`}
        aria-hidden="true"
      />
      <div
        className={`edge-corner-shadow edge-corner-br absolute pointer-events-none transition-opacity duration-300 ${
          isFocused ? "opacity-100" : "opacity-85 group-hover:opacity-100"
        }`}
        aria-hidden="true"
      />

      {/* Floating Interactive Canvas */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
