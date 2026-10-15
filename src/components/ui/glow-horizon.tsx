"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";

const EASE = [0.16, 1, 0.3, 1] as const;

export type GlowHorizonVariant = "top" | "bottom" | "left" | "right";

export interface GlowHorizonProps {
  className?: string;
  variant?: GlowHorizonVariant;
  themeOverride?: "dark" | "light";
}

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function GlowHorizonFM({
  className,
  themeOverride,
}: GlowHorizonProps) {
  const { resolvedTheme } = useTheme();
  const mounted = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isDark =
    themeOverride === "dark" ||
    (themeOverride !== "light" && (!mounted || resolvedTheme !== "light"));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <motion.div
        key={isDark ? "dark-horizon" : "light-horizon"}
        className={"absolute inset-0 w-full h-full pointer-events-none " + (className ?? "")}
        style={{
          isolation: "isolate",
        }}
        initial={{
          opacity: 0,
          y: -40,
          scale: 1.05,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{ duration: 1.4, ease: EASE }}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {/* Light Mode Gradients */}
            <linearGradient id="lightSkyHaze" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fafafa" stopOpacity="1" />
              <stop offset="45%" stopColor="#fafafa" stopOpacity="0.9" />
              <stop offset="75%" stopColor="#18181b" stopOpacity="0.25" />
              <stop offset="92%" stopColor="#09090b" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#09090b" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="lightGroundGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#09090b" stopOpacity="0.30" />
              <stop offset="25%" stopColor="#18181b" stopOpacity="0.14" />
              <stop offset="65%" stopColor="#71717a" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#fafafa" stopOpacity="0" />
            </linearGradient>

            {/* Dark Mode Gradients */}
            <linearGradient id="darkSkyHaze" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#050507" stopOpacity="1" />
              <stop offset="50%" stopColor="#09090b" stopOpacity="0.95" />
              <stop offset="80%" stopColor="#27272a" stopOpacity="0.35" />
              <stop offset="96%" stopColor="#71717a" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.98" />
            </linearGradient>

            <linearGradient id="darkGroundGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
              <stop offset="20%" stopColor="#e4e4e7" stopOpacity="0.15" />
              <stop offset="55%" stopColor="#71717a" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#050507" stopOpacity="0" />
            </linearGradient>
          </defs>

          {isDark ? (
            <>
              {/* Region Above Horizon: Deep Void to Crest */}
              <path
                d="M -50 -10 L 1050 -10 L 1050 270 Q 500 440 -50 270 Z"
                fill="url(#darkSkyHaze)"
              />

              {/* Atmospheric Ground Halo Below Horizon */}
              <path
                d="M -50 270 Q 500 440 1050 270 L 1050 490 Q 500 590 -50 490 Z"
                fill="url(#darkGroundGlow)"
              />

              {/* Brilliant Glowing White Crest Rim */}
              <path
                d="M -50 270 Q 500 440 1050 270"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                opacity="0.98"
              />
            </>
          ) : (
            <>
              {/* Region Above Horizon: Atmospheric Diffusion to Crest */}
              <path
                d="M -50 -10 L 1050 -10 L 1050 270 Q 500 440 -50 270 Z"
                fill="url(#lightSkyHaze)"
              />

              {/* Velvety Ground Shadow Below Horizon */}
              <path
                d="M -50 270 Q 500 440 1050 270 L 1050 490 Q 500 590 -50 490 Z"
                fill="url(#lightGroundGlow)"
              />

              {/* High-Definition Black Horizon Rim */}
              <path
                d="M -50 270 Q 500 440 1050 270"
                fill="none"
                stroke="#09090b"
                strokeWidth="2.5"
                opacity="0.95"
              />
            </>
          )}
        </svg>
      </motion.div>
    </div>
  );
}
