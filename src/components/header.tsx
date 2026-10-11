"use client";

import * as React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Plus } from "lucide-react";

interface HeaderProps {
  onOpenEnrollModal: () => void;
  totalStudents?: number;
  activeStudents?: number;
  archivedStudents?: number;
}

export function Header({
  onOpenEnrollModal,
  totalStudents = 0,
  activeStudents = 0,
  archivedStudents = 0,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full glass-nav transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Left: Brand Identity with Link to Landing */}
          <Link
            href="/"
            className="flex items-center gap-3 min-w-0 hover:opacity-85 transition-opacity"
          >
            <div className="w-7 h-7 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-zinc-100 dark:text-zinc-900 font-mono font-bold text-xs shadow-xs tracking-tighter">
              A
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-xs tracking-tight text-zinc-900 dark:text-zinc-100">
                ARCFIELD
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Registry
              </span>
            </div>
          </Link>

          {/* Center: Clean Live Census (Desktop) */}
          <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-zinc-400">
            <span>
              Active: <strong className="text-zinc-700 dark:text-zinc-300 font-medium">{activeStudents}</strong>
            </span>
            <span className="text-zinc-300 dark:text-zinc-800">·</span>
            <span>
              Total: <strong className="text-zinc-700 dark:text-zinc-300 font-medium">{totalStudents}</strong>
            </span>
            {archivedStudents > 0 && (
              <>
                <span className="text-zinc-300 dark:text-zinc-800">·</span>
                <span className="text-amber-600 dark:text-amber-400">
                  Archived: <strong className="font-medium">{archivedStudents}</strong>
                </span>
              </>
            )}
          </div>

          {/* Right: Actions & Theme Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />

            <button
              type="button"
              onClick={onOpenEnrollModal}
              className="tap-target inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll Student</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
