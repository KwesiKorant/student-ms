"use client";

import * as React from "react";

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
    return isAnyTooltipOpen.current || Date.now() - lastClosedTime.current < 350;
  }, []);

  const onTooltipOpened = React.useCallback(() => {
    isAnyTooltipOpen.current = true;
  }, []);

  const onTooltipClosed = React.useCallback(() => {
    isAnyTooltipOpen.current = false;
    lastClosedTime.current = Date.now();
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

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  delayDuration?: number;
}

export function Tooltip({
  content,
  children,
  side = "top",
  delayDuration = 160,
}: TooltipProps) {
  const context = React.useContext(TooltipContext);
  const [isOpen, setIsOpen] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const cleanupTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handlePointerEnter = () => {
    cleanupTimer();
    // Instant-adjacent opening if any tooltip was open recently (Emil Kowalski standard)
    const wasRecentlyOpen = context ? context.getWasRecentlyOpen() : false;

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

  const handlePointerLeave = () => {
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

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
  }[side];

  return (
    <div
      className="relative inline-flex items-center"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={handlePointerEnter}
      onBlur={handlePointerLeave}
    >
      {children}
      {isOpen && (
        <div
          role="tooltip"
          className={`absolute ${sideClasses} z-50 pointer-events-none select-none whitespace-nowrap rounded px-2 py-1 text-[11px] font-medium leading-none text-zinc-100 bg-zinc-900 dark:text-zinc-900 dark:bg-zinc-100 shadow-md border border-white/10 dark:border-black/10 animate-tooltip-enter font-mono`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
