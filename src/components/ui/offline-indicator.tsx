"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { WifiOff, CheckCircle2 } from "lucide-react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function getServerSnapshot() {
  return true;
}

/**
 * Offline Connectivity Telemetry HUD
 * Subscribes to window online/offline events via React.useSyncExternalStore (0 hydration mismatch).
 * Renders a floating, spring-animated status pill at the bottom viewport center.
 */
export function OfflineIndicator() {
  const isOnline = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [showRestored, setShowRestored] = React.useState(false);
  const wasOfflineRef = React.useRef(false);

  React.useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      setShowRestored(false);
    } else if (wasOfflineRef.current) {
      wasOfflineRef.current = false;
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  const isVisible = !isOnline || showRestored;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="offline-telemetry-hud"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 450, damping: 30 }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none"
        >
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium shadow-lg backdrop-blur-md border ${
              !isOnline
                ? "bg-zinc-900/90 dark:bg-zinc-950/95 text-zinc-200 border-rose-500/30 shadow-black/20"
                : "bg-emerald-950/90 text-emerald-200 border-emerald-500/40 shadow-emerald-950/20"
            }`}
          >
            {!isOnline ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span>Offline · Changes Paused</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Connection Restored</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
