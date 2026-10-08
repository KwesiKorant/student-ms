"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 animate-pulse border border-zinc-200 dark:border-white/10" />
    );
  }

  const cycleTheme = () => {
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="w-4 h-4 text-amber-500" />;
      case "dark":
        return <Moon className="w-4 h-4 text-indigo-400" />;
      default:
        return <Monitor className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case "light":
        return "Light mode";
      case "dark":
        return "Dark mode";
      default:
        return "System theme";
    }
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      title={`Current: ${getLabel()} (Click to cycle)`}
      aria-label={`Current: ${getLabel()} (Click to cycle)`}
      className="tap-target relative inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium rounded-md border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer select-none"
    >
      {getIcon()}
      <span className="capitalize">{theme ?? "system"}</span>
    </button>
  );
}
