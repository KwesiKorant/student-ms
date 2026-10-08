"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "motion/react";
import { cn } from "@/lib/utils";

export { Tooltip, TooltipProvider } from "@/components/ui/tooltip";

export interface AnimatedTooltipItem {
  id: number | string;
  name: string;
  designation?: string;
  image?: string;
}

export const AnimatedTooltip = ({
  items,
  className,
}: {
  items: AnimatedTooltipItem[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | string | null>(null);
  const springConfig = { stiffness: 220, damping: 18 };
  const x = useMotionValue(0);
  const rotate = useSpring(
    useTransform(x, [-50, 50], [-12, 12]),
    springConfig
  );
  const translateX = useSpring(
    useTransform(x, [-50, 50], [-15, 15]),
    springConfig
  );

  const boundsRef = React.useRef<{ left: number; width: number } | null>(null);

  const handlePointerEnter = (
    e: React.PointerEvent<HTMLDivElement>,
    id: number | string
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    boundsRef.current = { left: rect.left, width: rect.width };
    x.set(0);
    setHoveredIndex(id);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!boundsRef.current) return;
    const halfWidth = boundsRef.current.width / 2;
    const offset = e.clientX - boundsRef.current.left - halfWidth;
    x.set(Math.max(-halfWidth, Math.min(halfWidth, offset)));
  };

  const handlePointerLeave = () => {
    setHoveredIndex(null);
    boundsRef.current = null;
    x.set(0);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {items.map((item) => (
        <div
          className="-mr-3 relative group"
          key={item.id}
          onPointerEnter={(e) => handlePointerEnter(e, item.id)}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <AnimatePresence mode="popLayout">
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  },
                }}
                exit={{ opacity: 0, y: 10, scale: 0.92, transition: { duration: 0.1 } }}
                style={{
                  translateX,
                  rotate,
                  whiteSpace: "nowrap",
                }}
                className="absolute -top-14 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-white/10 z-50 shadow-xl px-3 py-1.5 pointer-events-none"
              >
                {/* Monochromatic Luminous Gradient Beam Line */}
                <div className="absolute inset-x-3 -bottom-px h-px z-30 bg-gradient-to-r from-transparent via-zinc-400 dark:via-zinc-300 to-transparent" />
                <div className="absolute left-1/4 w-1/2 -bottom-px h-[1.5px] z-30 bg-gradient-to-r from-transparent via-zinc-700 dark:via-white to-transparent opacity-80" />

                <div className="font-semibold text-zinc-900 dark:text-zinc-100 relative z-30 text-xs">
                  {item.name}
                </div>
                {item.designation && (
                  <div className="text-zinc-500 dark:text-zinc-400 text-[10px] font-mono mt-0.5">
                    {item.designation}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {item.image ? (
            <Image
              height={44}
              width={44}
              src={item.image}
              alt={item.name}
              className="object-cover !m-0 !p-0 rounded-full h-10 w-10 border-2 border-zinc-200 dark:border-zinc-800 group-hover:scale-105 group-hover:z-30 relative transition-transform duration-200 shadow-sm"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-700 flex items-center justify-center font-mono font-semibold text-xs text-zinc-700 dark:text-zinc-300 group-hover:scale-105 transition-transform shadow-sm">
              {item.name.charAt(0)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
