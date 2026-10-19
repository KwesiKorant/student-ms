"use client";

import * as React from "react";

export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  formatter?: (val: number) => string;
}

/**
 * 120 FPS Tabular Animated Counter
 * Directly mutates `spanRef.current.textContent` inside a `requestAnimationFrame` loop.
 * Zero React reconciler overhead or layout thrashing during live numerical updates.
 */
export function AnimatedCounter({
  value,
  duration = 600,
  className = "",
  prefix = "",
  suffix = "",
  formatter,
}: AnimatedCounterProps) {
  const spanRef = React.useRef<HTMLSpanElement>(null);
  const prevValueRef = React.useRef(value);
  const rafIdRef = React.useRef<number | null>(null);
  const isFirstRender = React.useRef(true);

  const format = React.useCallback(
    (n: number) => {
      const formatted = formatter ? formatter(n) : n.toLocaleString();
      return `${prefix}${formatted}${suffix}`;
    },
    [formatter, prefix, suffix]
  );

  React.useEffect(() => {
    // Initial mount: Render value directly without animation to avoid hydration flash
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevValueRef.current = value;
      if (spanRef.current) {
        spanRef.current.textContent = format(value);
      }
      return;
    }

    const startValue = prevValueRef.current;
    const targetValue = value;
    prevValueRef.current = targetValue;

    if (startValue === targetValue) {
      if (spanRef.current) spanRef.current.textContent = format(targetValue);
      return;
    }

    // Reduced motion fallback: instantaneous update
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      if (spanRef.current) spanRef.current.textContent = format(targetValue);
      return;
    }

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    const startTime = performance.now();

    const tick = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Cubic Ease-Out: 1 - (1 - t)^3
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (targetValue - startValue) * easeOut);

      if (spanRef.current) {
        spanRef.current.textContent = format(current);
      }

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        if (spanRef.current) {
          spanRef.current.textContent = format(targetValue);
        }
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [value, duration, format]);

  return (
    <span
      ref={spanRef}
      className={`font-mono tabular-nums tracking-tight ${className}`}
    >
      {format(value)}
    </span>
  );
}
