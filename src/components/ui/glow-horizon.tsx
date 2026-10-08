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

  // Professional monochrome palette (Rich celestial depth in dark mode, substantial full canopy in light mode)
  const arcConfigs = isDark
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
        base: "#09090b", // zinc-950 deep void
        baseBlur: 51,
      }
    : {
        // Substantial, weighted, rich canopy for light mode so it never looks thin
        crest: "#18181b", // zinc-900 defined horizon rim
        crestShadow: "0px 8px 36px 0px rgba(0, 0, 0, 0.38), 0px 2px 14px 0px rgba(0, 0, 0, 0.22)",
        crestSize: "134%",
        aura: "rgba(24, 24, 27, 0.25)", // deep graphite canopy aura
        auraSize: "122%",
        auraBlur: 36,
        glow: "rgba(82, 82, 91, 0.22)", // zinc-600 rich atmospheric body
        glowSize: "126%",
        glowBlur: 26,
        base: "rgba(113, 113, 122, 0.15)", // feathered base grounding
        baseBlur: 56,
      };

  return (
    <motion.div
      key={isDark ? "dark-horizon" : "light-horizon"}
      className={"absolute w-full h-full pointer-events-none " + (className ?? "")}
      style={{ isolation: "isolate" }}
      initial={{
        [axis]: enterPct,
        [scaleAxis]: 1.5,
        opacity: 0,
        filter: "blur(15px)",
      }}
      animate={{
        [axis]: restPct,
        [scaleAxis]: 1,
        opacity: 1,
        filter: "blur(0px)",
      }}
      transition={{ duration: DURATION, ease: EASE }}
    >
      <Arc
        variant={variant}
        color={arcConfigs.crest}
        size={arcConfigs.crestSize}
        boxShadow={arcConfigs.crestShadow}
        delay={1.2}
      />
      <Arc
        variant={variant}
        color={arcConfigs.aura}
        size={arcConfigs.auraSize}
        initialOffset="10%"
        blur={arcConfigs.auraBlur}
        delay={0.6}
      />
      <Arc
        variant={variant}
        color={arcConfigs.glow}
        size={arcConfigs.glowSize}
        initialOffset="10%"
        blur={arcConfigs.glowBlur}
        delay={0}
      />
      <Arc
        variant={variant}
        color={arcConfigs.base}
        size="120%"
        initialOffset="10%"
        blur={arcConfigs.baseBlur}
        delay={0}
      />
    </motion.div>
  );
}

function Arc({
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
