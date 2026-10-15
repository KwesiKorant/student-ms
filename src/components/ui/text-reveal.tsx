"use client";

import * as React from "react";

export interface TextRevealProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  scaleOffset?: number;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div" | "section";
}

/**
 * High-Performance Compositor-Only Text Reveal
 * Executes 100% on the GPU compositor thread via native CSS keyframes.
 * Zero JavaScript main-thread ticks or requestAnimationFrame overhead.
 */
export function TextReveal({
  children,
  delay = 0,
  duration = 0.45,
  yOffset = 8,
  scaleOffset = 0.98,
  className = "",
  as = "div",
  style,
  ...props
}: TextRevealProps) {
  const Component = as as React.ElementType;

  const dynamicStyle: React.CSSProperties = {
    ...style,
    "--reveal-delay": `${Math.round(delay * 1000)}ms`,
    "--reveal-duration": `${Math.round(duration * 1000)}ms`,
    ...(yOffset !== 8 ? { "--reveal-y": `${yOffset}px` } : {}),
    ...(scaleOffset !== 0.98 ? { "--reveal-scale": scaleOffset } : {}),
  } as React.CSSProperties;

  return (
    <Component
      className={`text-reveal-item ${className}`}
      style={dynamicStyle}
      {...props}
    >
      {children}
    </Component>
  );
}
