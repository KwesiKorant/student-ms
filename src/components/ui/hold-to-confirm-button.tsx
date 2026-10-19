"use client";

import * as React from "react";

export interface HoldToConfirmButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onConfirm: () => void;
  holdDurationMs?: number;
  label?: string;
  confirmingLabel?: string;
  className?: string;
  progressClassName?: string;
  disabled?: boolean;
}

/**
 * Hold-to-Confirm Tactile Destructive Trigger
 * Prevents accidental execution of destructive actions (purges, permanent deletions).
 * Asymmetric kinematics: 1,200ms RAF-driven linear hold, 160ms spring snap-back.
 * Zero-reflow clip-path progress mask (0 layout shifts).
 */
export function HoldToConfirmButton({
  onConfirm,
  holdDurationMs = 1200,
  label = "Hold to Confirm",
  confirmingLabel = "Hold to Purge...",
  className = "",
  progressClassName = "bg-rose-500/35",
  disabled = false,
  children,
  ...props
}: HoldToConfirmButtonProps) {
  const [progress, setProgress] = React.useState(0);
  const [isHolding, setIsHolding] = React.useState(false);
  const rafIdRef = React.useRef<number | null>(null);
  const startTimeRef = React.useRef<number | null>(null);

  const cancelHold = React.useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    startTimeRef.current = null;
    setIsHolding(false);
    setProgress(0);
  }, []);

  const startHold = React.useCallback(() => {
    if (disabled) return;
    setIsHolding(true);
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const nextProgress = Math.min(1, elapsed / holdDurationMs);
      setProgress(nextProgress);

      if (nextProgress < 1) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        cancelHold();
        onConfirm();
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);
  }, [disabled, holdDurationMs, onConfirm, cancelHold]);

  React.useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={startHold}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !isHolding) {
          e.preventDefault();
          startHold();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          cancelHold();
        }
      }}
      className={`relative overflow-hidden select-none tap-target cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {/* Zero-Reflow GPU Clip-Path Fill */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 pointer-events-none ${progressClassName}`}
        style={{
          clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)`,
          transition: isHolding
            ? "none"
            : "clip-path 160ms cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      />

      <span className="relative z-10 flex items-center justify-center gap-1.5 pointer-events-none">
        {children ? (
          typeof children === "function" ? (
            (children as (state: { isHolding: boolean; progress: number }) => React.ReactNode)({
              isHolding,
              progress,
            })
          ) : (
            children
          )
        ) : isHolding ? (
          <>
            <span>{confirmingLabel}</span>
            <span className="font-mono text-[10px] tabular-nums">
              {Math.round(progress * 100)}%
            </span>
          </>
        ) : (
          label
        )}
      </span>
    </button>
  );
}
