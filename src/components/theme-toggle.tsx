"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Guarantee system theme synchronization when theme === "system"
  React.useEffect(() => {
    if (!mounted || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const syncSystemTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    // Apply immediately upon selection or mount
    syncSystemTheme(mediaQuery);

    mediaQuery.addEventListener("change", syncSystemTheme);
    return () => mediaQuery.removeEventListener("change", syncSystemTheme);
  }, [mounted, theme]);

  if (!mounted) {
    return (
      <div className="h-7 w-20 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse border border-zinc-200/60 dark:border-white/5" />
    );
  }

  const currentTheme = theme ?? "system";

  const handleThemeChange = (nextTheme: string) => {
    if (nextTheme === currentTheme) return;
    setTheme(nextTheme);
  };

  return (
    <div
      role="group"
      aria-label="Display theme selection"
      className="inline-flex items-center p-0.5 rounded-lg border border-zinc-200/80 dark:border-white/10 bg-zinc-100/70 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400"
    >
      {/* Light Theme Option */}
      <Tooltip content="Light Theme" subContent="Clean crisp white canvas" side="bottom">
        <button
          type="button"
          onClick={() => handleThemeChange("light")}
          aria-label="Switch to light mode"
          aria-pressed={currentTheme === "light"}
          className={`tap-target p-1.5 rounded-md transition-colors cursor-pointer ${
            currentTheme === "light"
              ? "bg-white text-amber-500 shadow-xs border border-zinc-200/60"
              : "hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
        </button>
      </Tooltip>

      {/* Dark Theme Option */}
      <Tooltip content="Dark Theme" subContent="Deep void cosmic canvas" side="bottom">
        <button
          type="button"
          onClick={() => handleThemeChange("dark")}
          aria-label="Switch to dark mode"
          aria-pressed={currentTheme === "dark"}
          className={`tap-target p-1.5 rounded-md transition-colors cursor-pointer ${
            currentTheme === "dark"
              ? "bg-zinc-800 text-indigo-400 shadow-xs border border-white/10"
              : "hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
        </button>
      </Tooltip>

      {/* System Theme Option */}
      <Tooltip content="System Preference" subContent="Auto-synchronize with OS theme" side="bottom">
        <button
          type="button"
          onClick={() => handleThemeChange("system")}
          aria-label="Switch to system theme"
          aria-pressed={currentTheme === "system"}
          className={`tap-target p-1.5 rounded-md transition-colors cursor-pointer ${
            currentTheme === "system"
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200/60 dark:border-white/10"
              : "hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
        </button>
      </Tooltip>
    </div>
  );
}
