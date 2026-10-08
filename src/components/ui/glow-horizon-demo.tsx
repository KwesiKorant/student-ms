"use client";

import GlowHorizonFM from "@/components/ui/glow-horizon";
import { AnimatedTitleFM } from "@/components/ui/glow-horizon-utils/animated-title-fm";

interface GlowHorizonDemoProps {
  onExploreClick?: () => void;
  onEnrollClick?: () => void;
  className?: string;
}

export default function GlowHorizonDemo({
  onExploreClick,
  onEnrollClick,
  className = "",
}: GlowHorizonDemoProps) {
  return (
    <div
      className={`relative w-full h-full overflow-hidden flex items-center justify-center bg-zinc-50 dark:bg-[#050507] text-zinc-900 dark:text-zinc-100 transition-colors duration-200 ${className}`}
    >
      <GlowHorizonFM variant="top" />
      <div className="relative z-10 w-full flex flex-col items-center justify-center py-8">
        <AnimatedTitleFM
          open={true}
          onExploreClick={onExploreClick}
          onEnrollClick={onEnrollClick}
        />
      </div>
    </div>
  );
}
