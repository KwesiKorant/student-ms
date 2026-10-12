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
      } else if (e.key === "Escape") {
        if (isExpanded) {
          if (!internalQuery) {
            setIsExpanded(false);
          } else {
            setInternalQuery("");
            onChange?.("");
          }
          inputRef.current?.blur();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded, internalQuery, onChange]);

  // Ensure input gets focused immediately upon expansion
  React.useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
      const raf = requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isExpanded]);

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
  };

  const handleCollapse = () => {
    setInternalQuery("");
    onChange?.("");
    setIsExpanded(false);
  };

  const handleClearOrClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (internalQuery) {
      setInternalQuery("");
      onChange?.("");
      inputRef.current?.focus();
    } else {
      handleCollapse();
    }
  };

  return (
    <div className={`relative inline-flex items-center w-full sm:w-auto shrink-0 ${className}`}>
      <motion.div
        ref={containerRef}
        layout
        transition={{
          type: "spring",
          stiffness: 420,
          damping: 32,
        }}
        onClick={!isExpanded ? handleExpand : undefined}
        onKeyDown={(e) => {
          if (!isExpanded && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleExpand();
          }
        }}
        role={!isExpanded ? "button" : undefined}
        tabIndex={!isExpanded ? 0 : undefined}
        aria-expanded={isExpanded}
        aria-label="Search registry"
        title={!isExpanded ? "Search registry (/ or ⌘K)" : undefined}
        className={`group relative flex items-center h-10 rounded-2xl sm:rounded-full border backdrop-blur-md dark:backdrop-blur-none select-none overflow-hidden transition-colors duration-200 ${
          isExpanded
            ? "w-full sm:w-72 border-zinc-300 dark:border-white/20 bg-white/95 dark:bg-zinc-900 shadow-[0_10px_30px_-4px_rgba(0,0,0,0.12),0_4px_10px_-2px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_16px_-3px_rgba(255,255,255,0.05),0_2px_6px_-1px_rgba(255,255,255,0.02)]"
            : "w-full sm:w-10 border-zinc-200/90 dark:border-white/10 bg-white/80 dark:bg-zinc-900 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_-2px_rgba(0,0,0,0.14)] dark:shadow-[0_6px_12px_-3px_rgba(255,255,255,0.04),0_2px_4px_-1px_rgba(255,255,255,0.02)] dark:hover:shadow-[0_8px_16px_-3px_rgba(255,255,255,0.06)] hover:border-zinc-300 dark:hover:border-white/25 cursor-pointer"
        }`}
      >
        {/* Leading Search Icon */}
        <motion.div
          layout="position"
          className="w-10 h-10 flex items-center justify-center shrink-0 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors pointer-events-none"
        >
          <Search className="w-4 h-4 transition-transform group-hover:scale-105 shrink-0" />
        </motion.div>

        {/* Collapsed Mobile Placeholder Label (< sm) */}
        {!isExpanded && (
          <motion.div
            layout="position"
            className="flex sm:hidden items-center justify-between flex-1 pr-3.5"
          >
            <span className="text-xs text-zinc-400 font-sans">
              Search registry...
            </span>
            <kbd className="text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200/60 dark:border-white/10">
              ⌘K
            </kbd>
          </motion.div>
        )}

        {/* Expanded Search Input & Single Clear/Close Action */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex items-center h-full min-w-0 pr-1.5"
            >
              <input
                ref={(el) => {
                  inputRef.current = el;
                  if (el) {
                    el.focus();
                  }
                }}
                type="text"
                role="searchbox"
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                value={internalQuery}
                onChange={(e) => setInternalQuery(e.target.value)}
                placeholder={placeholder}
                className="h-full flex-1 bg-transparent px-1 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none font-sans [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:appearance-none"
              />

              <button
                type="button"
                onClick={handleClearOrClose}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                title={internalQuery ? "Clear search" : "Close search (Esc)"}
                aria-label={internalQuery ? "Clear search" : "Close search"}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
