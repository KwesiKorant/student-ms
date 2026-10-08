"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";

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

interface Coords {
  top: number;
  left: number;
}

export function Tooltip({
  content,
  subContent,
  children,
  side = "top",
  delayDuration = 120,
  className = "",
}: TooltipProps) {
  const context = React.useContext(TooltipContext);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isInstant, setIsInstant] = React.useState(false);
  const [coords, setCoords] = React.useState<Coords | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

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

  const updateCoordinates = (target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    let top = 0;
    let left = 0;

    if (side === "top") {
      top = rect.top - 8;
      left = rect.left + rect.width / 2;
    } else if (side === "bottom") {
      top = rect.bottom + 8;
      left = rect.left + rect.width / 2;
    } else if (side === "left") {
      top = rect.top + rect.height / 2;
      left = rect.left - 8;
    } else if (side === "right") {
      top = rect.top + rect.height / 2;
      left = rect.right + 8;
    }

    setCoords({ top, left });
  };

  const openTooltip = (target: HTMLElement) => {
    cleanupTimer();
    updateCoordinates(target);

    const wasRecentlyOpen = context ? context.getWasRecentlyOpen() : false;
    setIsInstant(wasRecentlyOpen);

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

  const closeTooltip = React.useCallback(() => {
    cleanupTimer();
    setIsOpen(false);
    context?.onTooltipClosed();
  }, [context]);

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    openTooltip(e.currentTarget);
  };

  const handlePointerLeave = () => {
    closeTooltip();
  };

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    openTooltip(e.currentTarget);
  };

  const handleBlur = () => {
    closeTooltip();
  };

  // Close immediately if scrolling, resizing, or pressing Escape
  React.useEffect(() => {
    if (!isOpen) return;

    const handleDismiss = () => closeTooltip();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeTooltip();
    };

    window.addEventListener("scroll", handleDismiss, { passive: true, capture: true });
    window.addEventListener("resize", handleDismiss, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleDismiss, { capture: true });
      window.removeEventListener("resize", handleDismiss);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeTooltip]);

  React.useEffect(() => {
    return () => cleanupTimer();
  }, []);

  const anchorClass = {
    top: "-translate-x-1/2 -translate-y-full",
    bottom: "-translate-x-1/2",
    left: "-translate-x-full -translate-y-1/2",
    right: "-translate-y-1/2",
  }[side];

  const transformOrigin = {
    top: "bottom center",
    bottom: "top center",
    left: "right center",
    right: "left center",
  }[side];

  const initialMotion = prefersReducedMotion
    ? { opacity: 0 }
    : {
        opacity: 0,
        scale: 0.94,
        y: side === "top" ? 4 : side === "bottom" ? -4 : 0,
        x: side === "left" ? 4 : side === "right" ? -4 : 0,
      };

  const animateMotion = prefersReducedMotion
    ? { opacity: 1 }
    : {
        opacity: 1,
        scale: 1,
        y: 0,
        x: 0,
        transition: isInstant
          ? ({ duration: 0.06, ease: "easeOut" } as const)
          : ({ type: "spring", stiffness: 380, damping: 24, mass: 0.5 } as const),
      };

  const exitMotion = prefersReducedMotion
    ? { opacity: 0 }
    : {
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.08, ease: "easeIn" as const },
      };

  return (
    <div
      className="inline-flex items-center"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}

      {/* Render via Portal to document.body: guaranteed to never be covered or clipped by overflow/stacking */}
      {typeof document !== "undefined" &&
        coords &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div
                style={{
                  position: "fixed",
                  top: coords.top,
                  left: coords.left,
                  zIndex: 9999,
                  pointerEvents: "none",
                }}
                className={`fixed ${anchorClass} z-[9999] pointer-events-none select-none`}
              >
                <motion.div
                  role="tooltip"
                  initial={initialMotion}
                  animate={animateMotion}
                  exit={exitMotion}
                  style={{
                    transformOrigin,
                    willChange: "transform, opacity",
                  }}
                  className={className}
                >
                {/* Floating Card with Institutional Monochromatic Luminous Beam Accent */}
                <div className="relative flex flex-col items-center justify-center rounded-lg px-2.5 py-1.5 shadow-2xl shadow-black/25 dark:shadow-black/70 border border-zinc-200/90 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-colors">
                  {/* Luminous metallic beam lines facing trigger target */}
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

                  {/* Primary Tooltip Label */}
                  <div className="font-semibold text-[11px] tracking-tight text-zinc-900 dark:text-zinc-50 relative z-30 leading-tight whitespace-nowrap">
                    {content}
                  </div>

                  {/* Secondary Context / Detail */}
                  {subContent && (
                    <div className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 relative z-30 leading-none mt-0.5 whitespace-nowrap">
                      {subContent}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
