"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";

export interface ExpandingSearchDockProps {
  value?: string;
  onChange?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function ExpandingSearchDock({
  value = "",
  onChange,
  placeholder = "Search registry (name, ID, email)...",
  className = "",
}: ExpandingSearchDockProps) {
  const [prevValue, setPrevValue] = React.useState(value);
  const [internalQuery, setInternalQuery] = React.useState(value);
  const [isExpanded, setIsExpanded] = React.useState(Boolean(value));
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync external value changes during render (zero cascade)
  if (value !== prevValue) {
    setPrevValue(value);
    setInternalQuery(value);
    if (value) {
      setIsExpanded(true);
    }
  }

  // Debounce notification to parent
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (internalQuery !== value) {
        onChange?.(internalQuery);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [internalQuery, value, onChange]);

  // Global keyboard shortcut: '/' or 'Cmd+K' to expand & focus, 'Escape' to collapse
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isSlash = e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey;
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";

      if (isSlash || isCmdK) {
        const target = e.target as HTMLElement | null;
        const isEditable =
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT" ||
            target.isContentEditable);

        if (isEditable && isSlash) return;

        e.preventDefault();
        setIsExpanded(true);
        setTimeout(() => {
          inputRef.current?.focus();
          inputRef.current?.select();
        }, 50);
      } else if (e.key === "Escape") {
        if (isExpanded) {
          if (!internalQuery) {
            setIsExpanded(false);
          }
          inputRef.current?.blur();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded, internalQuery]);

  // Collapse on click outside if query is empty
  React.useEffect(() => {
    if (!isExpanded) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        !internalQuery.trim()
      ) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded, internalQuery]);

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleCollapse = () => {
    setInternalQuery("");
    onChange?.("");
    setIsExpanded(false);
  };

  const handleClear = () => {
    setInternalQuery("");
    onChange?.("");
    inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center shrink-0 ${className}`}
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="collapsed-circle"
            type="button"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            whileHover={{
              scale: 1.08,
              y: -1,
              transition: { type: "spring", stiffness: 400, damping: 25 },
            }}
            whileTap={{ scale: 0.94 }}
            onClick={handleExpand}
            className="group relative flex items-center justify-center h-10 w-10 rounded-full border border-zinc-200/90 dark:border-white/10 bg-white/80 dark:bg-zinc-900 backdrop-blur-md dark:backdrop-blur-none text-zinc-500 dark:text-zinc-400 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_-2px_rgba(0,0,0,0.14)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.08),0_1px_3px_rgba(255,255,255,0.04)] dark:hover:shadow-[0_6px_28px_rgba(255,255,255,0.13),0_2px_6px_rgba(255,255,255,0.06)] hover:border-zinc-300 dark:hover:border-white/25 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all cursor-pointer select-none"
            title="Search registry (/ or ⌘K)"
            aria-label="Search registry"
          >
            <Search className="w-4 h-4 transition-transform group-hover:scale-105" />
          </motion.button>
        ) : (
          <motion.div
            key="expanded-dock"
            initial={{ width: 40, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 28,
            }}
            className="relative flex items-center h-10 w-64 sm:w-72 rounded-full border border-zinc-300 dark:border-white/20 bg-white/95 dark:bg-zinc-900 backdrop-blur-md dark:backdrop-blur-none shadow-[0_10px_30px_-4px_rgba(0,0,0,0.12),0_4px_10px_-2px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(255,255,255,0.10),0_2px_8px_rgba(255,255,255,0.05)] overflow-hidden"
          >
            <div className="pl-3.5 pr-1.5 flex items-center pointer-events-none text-zinc-400">
              <Search className="w-4 h-4" />
            </div>

            <input
              ref={inputRef}
              type="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={internalQuery}
              onChange={(e) => setInternalQuery(e.target.value)}
              placeholder={placeholder}
              className="h-full flex-1 bg-transparent px-1 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none font-sans"
            />

            {internalQuery ? (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 mr-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Clear text"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleCollapse}
              className="px-2.5 py-1 mr-1 text-[10px] font-mono font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Close search (Esc)"
              aria-label="Close search"
            >
              ESC
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
