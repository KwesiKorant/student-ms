"use client";

import * as React from "react";

/**
 * useModalDismiss
 * Enforces W3C modal accessibility and compositor-friendly body scroll isolation:
 * 1. Locks document.body scroll to prevent background scrolling/jumping.
 * 2. Binds global Escape key listener to close modal.
 * 3. Restores original body style upon unmount.
 * Zero external library dependencies, zero per-frame runtime overhead.
 */
export function useModalDismiss(isOpen: boolean, onClose: () => void) {
  React.useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);
}
