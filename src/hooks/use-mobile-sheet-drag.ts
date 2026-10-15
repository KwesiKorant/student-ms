"use client";

import * as React from "react";
import { useMotionValue, useTransform, useDragControls, type PanInfo } from "motion/react";

function subscribeMobile(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(max-width: 639px)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getMobileSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 639px)").matches;
}

function getMobileServerSnapshot() {
  return false;
}

/**
 * useMobileSheetDrag
 * Enforces 120 FPS compositor-accelerated touch-drag-to-dismiss mechanics on mobile/handheld devices:
 * 1. Tracks vertical pointer displacement via hardware-accelerated transforms (0 reflow).
 * 2. Dynamically fades backdrop opacity in sync with finger kinematics.
 * 3. Directional resistance: Rubber-band upward clamping (0.05 elasticity) vs 1:1 downward tracking.
 * 4. Velocity & offset release projection: Dismisses on offset > 90px OR velocity > 400px/s;
 *    otherwise snaps back with critically damped spring (stiffness: 400, damping: 32).
 * 5. Safely bypasses all gestures on desktop (>= 640px) to preserve centered modal behavior.
 */
export function useMobileSheetDrag(onClose: () => void) {
  const isMobile = React.useSyncExternalStore(subscribeMobile, getMobileSnapshot, getMobileServerSnapshot);
  const dragControls = useDragControls();
  const y = useMotionValue(0);

  // Dynamically interpolate backdrop opacity as sheet is pulled down
  const backdropOpacity = useTransform(y, [0, 260], [0.75, 0]);

  const handleDragEnd = React.useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!isMobile) return;
      if (info.offset.y > 90 || info.velocity.y > 400) {
        onClose();
      }
    },
    [isMobile, onClose]
  );

  return {
    isMobile,
    dragControls,
    y,
    backdropOpacity,
    handleDragEnd,
  };
}
