"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";

const EASE = [0.16, 1, 0.3, 1] as const;
const DURATION = 2;

export type GlowHorizonVariant = "top" | "bottom" | "left" | "right";

const VARIANTS: Record<
  GlowHorizonVariant,
  {
    axis: "x" | "y";
    scaleAxis: "scaleX" | "scaleY";
    enterPct: string;
    restPct: string;
  }
> = {
  top: { axis: "y", scaleAxis: "scaleY", enterPct: "-100%", restPct: "-50%" },
  bottom: { axis: "y", scaleAxis: "scaleY", enterPct: "100%", restPct: "50%" },
  left: { axis: "x", scaleAxis: "scaleX", enterPct: "100%", restPct: "50%" },
  right: { axis: "x", scaleAxis: "scaleX", enterPct: "-100%", restPct: "-50%" },
};

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
  variant = "top",
  themeOverride,
}: GlowHorizonProps) {
  const { resolvedTheme } = useTheme();
  const mounted = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isDark =
    themeOverride === "dark" ||
    (themeOverride !== "light" && (!mounted || resolvedTheme !== "light"));

  const { axis, scaleAxis, enterPct, restPct } = VARIANTS[variant];

  // Desktop high-fidelity celestial multi-arc configuration (Rich 54px atmospheric blurs & deep shadows)
  const desktopArcConfigs = isDark
    ? {
        crest: "#FFFFFF",
        crestShadow: "0px -4px 34px 0px rgba(255, 255, 255, 0.95)",
        crestSize: "132%",
        aura: "rgba(228, 228, 231, 0.35)", // zinc-200 silver halo
        auraSize: "120%",
        auraBlur: 31,
        glow: "rgba(113, 113, 122, 0.30)", // zinc-500 platinum sheen
        glowSize: "124%",
        glowBlur: 21,
        base: "#000000", // pure deep void
        baseSize: "122%",
        baseBlur: 45,
      }
    : {
        crest: "#09090b", // deep black defined horizon rim
        crestShadow:
          "0px 20px 72px 0px rgba(0, 0, 0, 0.36), 0px 8px 36px 0px rgba(0, 0, 0, 0.20), 0px 2px 12px 0px rgba(0, 0, 0, 0.14)",
        crestSize: "135%",
        aura: "rgba(9, 9, 11, 0.28)", // expansive atmospheric diffusion
        auraSize: "122%",
        auraBlur: 54,
        glow: "rgba(24, 24, 27, 0.22)", // wide velvety ambient haze
        glowSize: "130%",
        glowBlur: 40,
        base: "#fafafa", // canvas matching inner body with wide soft feathering
        baseSize: "114%",
        baseBlur: 46,
      };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* ── Tier 1: Desktop High-Fidelity Multi-Tier Celestial Blur Horizon (>= 1024px) ── */}
      <div className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none">
        <motion.div
          key={isDark ? "desktop-dark-horizon" : "desktop-light-horizon"}
          className={"absolute w-full h-full pointer-events-none " + (className ?? "")}
          style={{ isolation: "isolate" }}
          initial={{
            [axis]: enterPct,
            [scaleAxis]: 1.5,
            opacity: 0,
          }}
          animate={{
            [axis]: restPct,
            [scaleAxis]: 1,
            opacity: 1,
          }}
          transition={{ duration: DURATION, ease: EASE }}
        >
          <DesktopArc
            variant={variant}
            color={desktopArcConfigs.crest}
            size={desktopArcConfigs.crestSize}
            boxShadow={desktopArcConfigs.crestShadow}
            delay={1.2}
          />
          <DesktopArc
            variant={variant}
            color={desktopArcConfigs.aura}
            size={desktopArcConfigs.auraSize}
            initialOffset="10%"
            blur={desktopArcConfigs.auraBlur}
            delay={0.6}
          />
          <DesktopArc
            variant={variant}
            color={desktopArcConfigs.glow}
            size={desktopArcConfigs.glowSize}
            initialOffset="10%"
            blur={desktopArcConfigs.glowBlur}
            delay={0}
          />
          <DesktopArc
            variant={variant}
            color={desktopArcConfigs.base}
            size={desktopArcConfigs.baseSize}
            initialOffset="10%"
            blur={desktopArcConfigs.baseBlur}
            delay={0}
          />
        </motion.div>
      </div>

      {/* ── Tier 2: Mobile / Handheld High-Performance Vector Horizon (< 1024px) ── */}
      <div className="block lg:hidden absolute inset-0 w-full h-full pointer-events-none">
        <motion.div
          key={isDark ? "mobile-dark-horizon" : "mobile-light-horizon"}
          className={"absolute inset-0 w-full h-full pointer-events-none " + (className ?? "")}
          style={{ isolation: "isolate" }}
          initial={{
            opacity: 0,
            y: -30,
            scale: 1.04,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{ duration: 1.2, ease: EASE }}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 600"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="mLightSkyHaze" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fafafa" stopOpacity="1" />
                <stop offset="45%" stopColor="#fafafa" stopOpacity="0.9" />
                <stop offset="75%" stopColor="#18181b" stopOpacity="0.25" />
                <stop offset="92%" stopColor="#09090b" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#09090b" stopOpacity="0.95" />
              </linearGradient>

              <linearGradient id="mLightGroundGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#09090b" stopOpacity="0.30" />
                <stop offset="25%" stopColor="#18181b" stopOpacity="0.14" />
                <stop offset="65%" stopColor="#71717a" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#fafafa" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="mDarkSkyHaze" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#050507" stopOpacity="1" />
                <stop offset="50%" stopColor="#09090b" stopOpacity="0.95" />
                <stop offset="80%" stopColor="#27272a" stopOpacity="0.35" />
                <stop offset="96%" stopColor="#71717a" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.98" />
              </linearGradient>

              <linearGradient id="mDarkGroundGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
                <stop offset="20%" stopColor="#e4e4e7" stopOpacity="0.15" />
                <stop offset="55%" stopColor="#71717a" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#050507" stopOpacity="0" />
              </linearGradient>
            </defs>

            {isDark ? (
              <>
                <path
                  d="M -50 -10 L 1050 -10 L 1050 270 Q 500 440 -50 270 Z"
                  fill="url(#mDarkSkyHaze)"
                />
                <path
                  d="M -50 270 Q 500 440 1050 270 L 1050 490 Q 500 590 -50 490 Z"
                  fill="url(#mDarkGroundGlow)"
                />
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
                <path
                  d="M -50 -10 L 1050 -10 L 1050 270 Q 500 440 -50 270 Z"
                  fill="url(#mLightSkyHaze)"
                />
                <path
                  d="M -50 270 Q 500 440 1050 270 L 1050 490 Q 500 590 -50 490 Z"
                  fill="url(#mLightGroundGlow)"
                />
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
    </div>
  );
}

function DesktopArc({
  variant,
  color,
  size,
  initialOffset,
  blur,
  boxShadow,
  delay,
}: {
  variant: GlowHorizonVariant;
  color: string;
  size: string;
  initialOffset?: string;
  blur?: number;
  boxShadow?: string;
  delay: number;
}) {
  const scale = parseFloat(size) / 100;
  const { axis, enterPct } = VARIANTS[variant];
  const sign = enterPct.startsWith("-") ? -1 : 1;
  const startPct = initialOffset
    ? `${sign * Math.abs(parseFloat(initialOffset) - 50)}%`
    : undefined;

  return (
    <motion.div
      aria-hidden
      className="absolute inset-0 rounded-[100%]"
      style={{
        scale,
        background: color,
        ...(blur !== undefined && { filter: `blur(${blur}px)` }),
        ...(boxShadow && { boxShadow }),
      }}
      initial={startPct ? { [axis]: startPct } : false}
      animate={startPct ? { [axis]: 0 } : undefined}
      transition={{ duration: DURATION, ease: EASE, delay }}
    />
  );
}
