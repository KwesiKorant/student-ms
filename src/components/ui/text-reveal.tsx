"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";

export interface TextRevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
}

export function TextReveal({
  children,
  delay = 0,
  duration = 0.45,
  yOffset = 10,
  className = "",
  as = "div",
  ...props
}: TextRevealProps) {
  const Component = motion[as] as typeof motion.div;

  return (
    <Component
      initial={{ opacity: 0, y: yOffset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}
