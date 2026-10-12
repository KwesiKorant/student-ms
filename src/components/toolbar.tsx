"use client";

import * as React from "react";
import { Department } from "@/types/student";
import {
  X,
  RotateCw,
  ArrowUpDown,
  Filter,
  Download,
  ChevronDown,
} from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

interface ToolbarProps {
  departmentId: string;
  onDepartmentChange: (value: string) => void;
  academicYear?: number | "";
  onAcademicYearChange?: (value: number | "") => void;
  status: string;
  onStatusChange: (value: string) => void;
  gpaTier?: string;
  onGpaTierChange?: (value: string) => void;
  includeArchived: boolean;
  onIncludeArchivedChange: (value: boolean) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;
  departments: Department[];
  onRefresh: () => void;
  isLoading: boolean;
  onResetFilters: () => void;
  onExport?: () => void;
  isExporting?: boolean;
  isLiveSync?: boolean;
  search?: string;
  onClearSearch?: () => void;
}

export function Toolbar({
  departmentId,
  onDepartmentChange,
  academicYear = "",
  onAcademicYearChange,
  status,
  onStatusChange,
  gpaTier = "",
  onGpaTierChange,
  includeArchived,
  onIncludeArchivedChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  departments,
  onRefresh,
  isLoading,
  onResetFilters,
  onExport,
  isExporting = false,
  isLiveSync = false,
  search = "",
  onClearSearch,
}: ToolbarProps) {
  const moreFiltersRef = React.useRef<HTMLDivElement>(null);
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = React.useState(false);

  // Close "More Filters" popover when clicking outside or pressing Escape
  React.useEffect(() => {
    if (!isMoreFiltersOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (moreFiltersRef.current && !moreFiltersRef.current.contains(e.target as Node)) {
        setIsMoreFiltersOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMoreFiltersOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMoreFiltersOpen]);

  // Active advanced filters count
  const advancedFilterCount =
    (status !== "" ? 1 : 0) +
    (gpaTier !== "" ? 1 : 0) +
    (includeArchived ? 1 : 0);

  const hasAnyFilterActive =
    (search && search.trim() !== "") ||
    departmentId !== "" ||
    academicYear !== "" ||
    status !== "" ||
    gpaTier !== "" ||
    includeArchived;

  return (
    <div className="w-full space-y-2 relative z-20 overflow-visible">
      {/* Primary Toolbar Container (overflow-visible, unclipped popovers) */}
      <div className="relative flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 p-2 rounded-xl glass-card overflow-visible">
        {/* Left Section: Direct Parametric Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0 overflow-visible">
          {/* Primary Filter 1: Department */}
          <div className="relative inline-flex items-center">
            <select
              value={departmentId}
              onChange={(e) => onDepartmentChange(e.target.value)}
              aria-label="Filter by department"
              className="appearance-none pl-2.5 pr-7 py-1.5 text-xs rounded-lg border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer transition-colors"
            >
              <option value="" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                All Departments
              </option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-400 pointer-events-none absolute right-2" />
          </div>

          {/* Primary Filter 2: Academic Year */}
          <div className="relative inline-flex items-center">
            <select
              value={academicYear}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Number(e.target.value);
                onAcademicYearChange?.(val);
              }}
              aria-label="Filter by academic year"
              className="appearance-none pl-2.5 pr-7 py-1.5 text-xs rounded-lg border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer transition-colors"
            >
              <option value="" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                All Years
              </option>
              <option value={1} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Year 1 (Freshman)</option>
              <option value={2} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Year 2 (Sophomore)</option>
              <option value={3} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Year 3 (Junior)</option>
              <option value={4} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Year 4 (Senior)</option>
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-400 pointer-events-none absolute right-2" />
          </div>

          {/* Primary Filter 3: "More Filters" Popover Trigger */}
          <div className="relative inline-flex items-center" ref={moreFiltersRef}>
            <button
              type="button"
              onClick={() => setIsMoreFiltersOpen((prev) => !prev)}
              aria-expanded={isMoreFiltersOpen}
              className={`tap-target inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border cursor-pointer select-none transition-colors ${
                advancedFilterCount > 0
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 font-medium"
                  : "bg-white/70 dark:bg-zinc-900/70 border-zinc-200/80 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Filter className="w-3.5 h-3.5 shrink-0" />
              <span>Filters</span>
              {advancedFilterCount > 0 ? (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-mono flex items-center justify-center font-bold">
                  {advancedFilterCount}
                </span>
              ) : (
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              )}
            </button>

            {/* "More Filters" Floating Popover (Unclipped & High Stacking Priority) */}
            {isMoreFiltersOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-72 z-50 rounded-xl shadow-2xl bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-white/15 p-3.5 space-y-3.5 animate-modal-enter text-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-white/5">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono text-[11px] uppercase tracking-wider">
                    Advanced Filters
                  </span>
                  {advancedFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        onStatusChange("");
                        onGpaTierChange?.("");
                        onIncludeArchivedChange(false);
                      }}
                      className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer font-mono"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* 1. Status Filter */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    Enrollment Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-zinc-200/80 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="GRADUATED">Graduated</option>
                  </select>
                </div>

                {/* 2. GPA Standing Tier Filter */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    Academic Standing (GPA)
                  </label>
                  <select
                    value={gpaTier}
                    onChange={(e) => onGpaTierChange?.(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-zinc-200/80 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                  >
                    <option value="">All Academic Standings</option>
                    <option value="deans_list">Dean&apos;s List (GPA ≥ 3.50)</option>
                    <option value="good_standing">Good Standing (GPA 2.50 – 3.49)</option>
                    <option value="probation">Academic Probation (GPA &lt; 2.00)</option>
                  </select>
                </div>

                {/* 3. Soft-Archived Toggle */}
                <div className="pt-2 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      Include Archived
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      Show soft-archived student dossiers
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={includeArchived}
                    onClick={() => onIncludeArchivedChange(!includeArchived)}
                    className={`w-8 h-4.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      includeArchived ? "bg-amber-500" : "bg-zinc-200 dark:bg-zinc-700"
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform ${
                        includeArchived ? "translate-x-3.5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: View & Output Controls (Clearly Separated) */}
        <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-zinc-200/80 dark:border-white/10 pt-2 md:pt-0 md:pl-2.5">
          {/* Sorting Control */}
          <div className="flex items-center gap-1">
            <div className="relative inline-flex items-center">
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
                aria-label="Sort records by"
                className="appearance-none pl-2 pr-6 py-1.5 text-xs rounded-lg border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer transition-colors"
              >
                <option value="createdAt" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Date Enrolled</option>
                <option value="name" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Full Name</option>
                <option value="studentId" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Student ID</option>
                <option value="department" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Department</option>
                <option value="gpa" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">GPA Score</option>
                <option value="academicYear" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Academic Year</option>
              </select>
              <ChevronDown className="w-3 h-3 text-zinc-400 pointer-events-none absolute right-1.5" />
            </div>

            <Tooltip
              content={sortOrder === "asc" ? "Sort Ascending" : "Sort Descending"}
              subContent={`Currently sorting ${sortOrder.toUpperCase()}`}
              side="top"
            >
              <button
                type="button"
                onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
                aria-label="Toggle sort order"
                className="tap-target p-1.5 rounded-lg border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 cursor-pointer transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>

          {/* Realtime Live Sync Badge */}
          {isLiveSync && (
            <div
              className="hidden lg:inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono tracking-tight"
              title="Connected to Supabase Realtime WebSocket"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Sync</span>
            </div>
          )}

          {/* Actions: Refresh & Export */}
          <Tooltip
            content="Synchronize Registry"
            subContent="Re-query latest records from database"
            side="top"
          >
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              aria-label="Refresh student directory"
              className="tap-target p-1.5 rounded-lg border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 cursor-pointer transition-colors disabled:opacity-40"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-zinc-800 dark:text-zinc-200" : ""}`} />
            </button>
          </Tooltip>

          {onExport && (
            <Tooltip
              content="Export Registry"
              subContent="Download filtered dataset as UTF-8 CSV"
              side="top"
            >
              <button
                type="button"
                onClick={onExport}
                disabled={isExporting}
                aria-label="Export student registry to CSV"
                className="tap-target p-1.5 rounded-lg border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 cursor-pointer transition-colors disabled:opacity-40"
              >
                <Download className={`w-3.5 h-3.5 ${isExporting ? "animate-pulse" : ""}`} />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Active Filter Indicators Micro-Strip */}
      {hasAnyFilterActive && (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono px-1">
          <span className="text-zinc-400">ACTIVE:</span>

          {search && search.trim() !== "" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-white/5">
              <span>query:&ldquo;{search}&rdquo;</span>
              {onClearSearch && (
                <button
                  type="button"
                  onClick={onClearSearch}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </span>
          )}

          {departmentId !== "" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-white/5">
              <span>dept:{departments.find((d) => d.id === departmentId)?.code || "custom"}</span>
              <button
                type="button"
                onClick={() => onDepartmentChange("")}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}

          {academicYear !== "" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-white/5">
              <span>year:{academicYear}</span>
              <button
                type="button"
                onClick={() => onAcademicYearChange?.("")}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}

          {status !== "" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-white/5">
              <span>status:{status.toLowerCase()}</span>
              <button
                type="button"
                onClick={() => onStatusChange("")}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}

          {gpaTier !== "" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-white/5">
              <span>gpa:{gpaTier === "deans_list" ? "≥3.5" : gpaTier === "good_standing" ? "2.5-3.5" : "<2.0"}</span>
              <button
                type="button"
                onClick={() => onGpaTierChange?.("")}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}

          {includeArchived && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              <span>archived:included</span>
              <button
                type="button"
                onClick={() => onIncludeArchivedChange(false)}
                className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={onResetFilters}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:underline cursor-pointer ml-1"
          >
            Reset all
          </button>
        </div>
      )}
    </div>
  );
}
