"use client";

import * as React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserPlus, Shield, Database } from "lucide-react";

interface HeaderProps {
  onOpenEnrollModal: () => void;
  totalStudents?: number;
  activeStudents?: number;
  archivedStudents?: number;
}

export function Header({
  onOpenEnrollModal,
  totalStudents,
  activeStudents,
  archivedStudents,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-zinc-100 dark:text-zinc-900 font-mono font-bold text-sm shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                  ARCFIELD SYSTEMS
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/10">
                  SMS · V1.0
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                Institutional Academic Lifecycle & Records Registry
              </p>
            </div>
          </div>

          {/* Center: System Status & Quick Metrics (Desktop) */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                SYSTEM OPERATIONAL
              </span>
            </div>

            <div className="flex items-center gap-3 pl-2 border-l border-zinc-200 dark:border-zinc-800">
              <span className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-zinc-400" />
                <span>
                  Total:{" "}
                  <strong className="text-zinc-800 dark:text-zinc-200">
                    {totalStudents ?? "—"}
                  </strong>
                </span>
              </span>
              <span>·</span>
              <span>
                Active:{" "}
                <strong className="text-zinc-800 dark:text-zinc-200">
                  {activeStudents ?? "—"}
                </strong>
              </span>
              <span>·</span>
              <span>
                Archived:{" "}
                <strong className="text-zinc-800 dark:text-zinc-200">
                  {archivedStudents ?? "—"}
                </strong>
              </span>
            </div>
          </div>

          {/* Right: Actions & Theme Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <ThemeToggle />

            <button
              type="button"
              onClick={onOpenEnrollModal}
              className="tap-target inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-sm cursor-pointer transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Enroll Student</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
