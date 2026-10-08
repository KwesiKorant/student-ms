"use client";

import * as React from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

interface TooltipContextType {
  getWasRecentlyOpen: () => boolean;
  onTooltipOpened: () => void;
  onTooltipClosed: () => void;
}

const TooltipContext = React.createContext<TooltipContextType | null>(null);

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  const lastClosedTime = React.useRef<number>(0);
  const isAnyTooltipOpen = React.useRef<boolean>(false);

  const getWasRecentlyOpen = React.useCallback(() => {
    if (typeof window === "undefined" || typeof performance === "undefined") return false;
    return isAnyTooltipOpen.current || performance.now() - lastClosedTime.current < 400;
  }, []);

  const onTooltipOpened = React.useCallback(() => {
    isAnyTooltipOpen.current = true;
  }, []);

  const onTooltipClosed = React.useCallback(() => {
    isAnyTooltipOpen.current = false;
    lastClosedTime.current = typeof performance !== "undefined" ? performance.now() : 0;
  }, []);

  const value = React.useMemo(
    () => ({ getWasRecentlyOpen, onTooltipOpened, onTooltipClosed }),
    [getWasRecentlyOpen, onTooltipOpened, onTooltipClosed]
  );

  return (
    <TooltipContext.Provider value={value}>
      {children}
    </TooltipContext.Provider>
  );
}

export interface TooltipProps {
  content: React.ReactNode;
  subContent?: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  delayDuration?: number;
  className?: string;
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

const SPRING_CONFIG = { stiffness: 260, damping: 20 };

export function Tooltip({
  content,
  subContent,
  children,
  side = "top",
  delayDuration = 140,
  className = "",
}: TooltipProps) {
  const context = React.useContext(TooltipContext);
  const [isOpen, setIsOpen] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const boundsRef = React.useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  const isInstantRef = React.useRef<boolean>(false);

  // Mouse-tracking dynamic tilt & glide (motion compositor only - zero layout reflow)
  const x = useMotionValue(0);
  const rotate = useSpring(useTransform(x, [-50, 50], [-7, 7]), SPRING_CONFIG);
  const translateX = useSpring(useTransform(x, [-50, 50], [-9, 9]), SPRING_CONFIG);

  const prefersReducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const cleanupTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    cleanupTimer();
    // Cache target element bounds once upon entry (zero layout reads during mousemove)
    const rect = e.currentTarget.getBoundingClientRect();
    boundsRef.current = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
    x.set(0);

    // Instant tooltip opening on subsequent adjacent hovers (Emil Kowalski standard)
    const wasRecentlyOpen = context ? context.getWasRecentlyOpen() : false;
    isInstantRef.current = wasRecentlyOpen;
    if (wasRecentlyOpen) {
      setIsOpen(true);
      context?.onTooltipOpened();
    } else {
      timerRef.current = setTimeout(() => {
        setIsOpen(true);
        context?.onTooltipOpened();
      }, delayDuration);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!boundsRef.current || prefersReducedMotion) return;
    const halfWidth = boundsRef.current.width / 2;
    const offset = e.clientX - boundsRef.current.left - halfWidth;
    x.set(Math.max(-halfWidth, Math.min(halfWidth, offset)));
  };

  const handlePointerLeave = () => {
    cleanupTimer();
    setIsOpen(false);
    context?.onTooltipClosed();
    boundsRef.current = null;
    x.set(0);
  };

  const handleFocus = () => {
    cleanupTimer();
    const wasRecentlyOpen = context ? context.getWasRecentlyOpen() : false;
    isInstantRef.current = wasRecentlyOpen;
    if (wasRecentlyOpen) {
      setIsOpen(true);
      context?.onTooltipOpened();
    } else {
      timerRef.current = setTimeout(() => {
        setIsOpen(true);
        context?.onTooltipOpened();
      }, delayDuration);
    }
  };

  const handleBlur = () => {
    cleanupTimer();
    setIsOpen(false);
    context?.onTooltipClosed();
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cleanupTimer();
    };
  }, [isOpen]);

  const sidePositionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }[side];

  return (
    <div
      className="relative inline-flex items-center"
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="tooltip"
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    scale: 0.92,
                    y: side === "bottom" ? -5 : side === "top" ? 5 : 0,
                    x: side === "right" ? -5 : side === "left" ? 5 : 0,
                  }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    x: 0,
                    transition: isInstantRef.current
                      ? { duration: 0.08, ease: "easeOut" }
                      : { type: "spring", stiffness: 360, damping: 22 },
                  }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    scale: 0.94,
                    y: side === "bottom" ? -3 : side === "top" ? 3 : 0,
                    x: side === "right" ? -3 : side === "left" ? 3 : 0,
                    transition: { duration: 0.1, ease: "easeIn" },
                  }
            }
            style={{
              translateX: prefersReducedMotion ? 0 : side === "left" || side === "right" ? 0 : translateX,
              translateY: prefersReducedMotion ? 0 : side === "left" || side === "right" ? translateX : 0,
              rotate: prefersReducedMotion ? 0 : rotate,
              whiteSpace: "nowrap",
            }}
            className={`absolute ${sidePositionClasses} z-50 pointer-events-none select-none ${className}`}
          >
            {/* Signature Floating Card with Monochromatic Luminous Gradient Beam */}
            <div className="relative flex flex-col items-center justify-center rounded-lg px-2.5 py-1.5 shadow-xl shadow-black/15 dark:shadow-black/50 border border-zinc-200/90 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-colors">
              {/* Luminous Beam Lines dynamically facing target on all 4 axes */}
              {side === "top" && (
                <>
                  <div className="absolute inset-x-3 -bottom-px h-px z-30 bg-gradient-to-r from-transparent via-zinc-400 dark:via-zinc-300 to-transparent opacity-85" />
                  <div className="absolute left-1/4 w-1/2 -bottom-px h-[1.5px] z-30 bg-gradient-to-r from-transparent via-zinc-700 dark:via-white to-transparent opacity-70" />
                </>
              )}
              {side === "bottom" && (
                <>
                  <div className="absolute inset-x-3 -top-px h-px z-30 bg-gradient-to-r from-transparent via-zinc-400 dark:via-zinc-300 to-transparent opacity-85" />
                  <div className="absolute left-1/4 w-1/2 -top-px h-[1.5px] z-30 bg-gradient-to-r from-transparent via-zinc-700 dark:via-white to-transparent opacity-70" />
                </>
              )}
              {side === "left" && (
                <>
                  <div className="absolute inset-y-2 -right-px w-px z-30 bg-gradient-to-b from-transparent via-zinc-400 dark:via-zinc-300 to-transparent opacity-85" />
                  <div className="absolute top-1/4 h-1/2 -right-px w-[1.5px] z-30 bg-gradient-to-b from-transparent via-zinc-700 dark:via-white to-transparent opacity-70" />
                </>
              )}
              {side === "right" && (
                <>
                  <div className="absolute inset-y-2 -left-px w-px z-30 bg-gradient-to-b from-transparent via-zinc-400 dark:via-zinc-300 to-transparent opacity-85" />
                  <div className="absolute top-1/4 h-1/2 -left-px w-[1.5px] z-30 bg-gradient-to-b from-transparent via-zinc-700 dark:via-white to-transparent opacity-70" />
                </>
              )}

              {/* Title / Main Content */}
              <div className="font-semibold text-[11px] tracking-tight text-zinc-900 dark:text-zinc-50 relative z-30 leading-tight">
                {content}
              </div>

              {/* Optional Secondary Detail / Shortcut */}
              {subContent && (
                <div className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 relative z-30 leading-none mt-0.5">
                  {subContent}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
