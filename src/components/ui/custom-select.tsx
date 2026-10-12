"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Check } from "lucide-react";

export interface CustomSelectOption<T extends string | number = string> {
  value: T;
  label: string;
  badge?: string;
}

export interface CustomSelectProps<T extends string | number = string> {
  value: T;
  onChange: (value: T) => void;
  options: CustomSelectOption<T>[];
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  align?: "left" | "right";
  disabled?: boolean;
}

export function CustomSelect<T extends string | number = string>({
  value,
  onChange,
  options,
  placeholder = "Select...",
  ariaLabel,
  className = "",
  triggerClassName = "",
  menuClassName = "",
  align = "left",
  disabled = false,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const listboxId = React.useId();

  // Find currently active option
  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside or pressing Escape
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center text-xs ${className}`}
    >
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel || placeholder}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`tap-target inline-flex items-center justify-between gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border transition-all cursor-pointer select-none font-sans ${
          isOpen
            ? "border-zinc-300 dark:border-white/25 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 ring-1 ring-zinc-400 dark:ring-white/20 shadow-xs"
            : "border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 hover:bg-white dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-white/20"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${triggerClassName}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-3 h-3 shrink-0 transition-transform duration-200 ${
            isOpen
              ? "rotate-180 text-zinc-700 dark:text-zinc-200"
              : "text-zinc-400"
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={listboxId}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 28,
            }}
            role="listbox"
            aria-label={ariaLabel || placeholder}
            className={`absolute top-full mt-1.5 z-50 min-w-full w-max max-w-[calc(100vw-2rem)] sm:max-w-xs rounded-xl shadow-2xl dark:shadow-[0_10px_20px_-4px_rgba(255,255,255,0.04),0_4px_8px_-2px_rgba(255,255,255,0.02),0_16px_32px_rgba(0,0,0,0.8)] bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-white/15 p-1 max-h-60 overflow-y-auto font-sans text-xs ${
              align === "right" ? "right-0" : "left-0"
            } ${menuClassName}`}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`flex items-center justify-between gap-2.5 w-full px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer text-left select-none ${
                    isSelected
                      ? "bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white font-medium"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-white/[0.06] hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {option.badge && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {option.badge}
                      </span>
                    )}
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
