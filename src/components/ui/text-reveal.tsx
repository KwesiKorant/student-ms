"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";

export interface TextRevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  scaleOffset?: number;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div" | "section";
}

export function TextReveal({
  children,
  delay = 0,
  duration = 0.75,
  yOffset = 20,
  scaleOffset = 0.98,
  className = "",
  as = "div",
  ...props
}: TextRevealProps) {
  const Component = motion[as] as typeof motion.div;

  return (
    <Component
      initial={{ opacity: 0, y: yOffset, scale: scaleOffset }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // Smooth spatial deceleration curve (fluid momentum)
      }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}
