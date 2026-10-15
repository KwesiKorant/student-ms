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
import { AnimatePresence, motion } from "motion/react";
import { Tooltip } from "@/components/ui/tooltip";
import { CustomSelect, CustomSelectOption } from "@/components/ui/custom-select";

export interface ActiveFilterChipsProps {
  search?: string;
  onClearSearch?: () => void;
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
  departments: Department[];
  onResetFilters: () => void;
}

export function ActiveFilterChips({
  search = "",
  onClearSearch,
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
  departments,
  onResetFilters,
}: ActiveFilterChipsProps) {
  const hasAnyFilterActive =
    search.trim() !== "" ||
    departmentId !== "" ||
    academicYear !== "" ||
    status !== "" ||
    gpaTier !== "" ||
    includeArchived;

  if (!hasAnyFilterActive) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono px-1">
      <span className="text-zinc-400">ACTIVE:</span>

      {search.trim() !== "" && (
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
  );
}

export interface ToolbarProps {
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
  showActiveChips?: boolean;
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
  showActiveChips = true,
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

  // Memoized options for custom selects matching design language
  const departmentOptions = React.useMemo<CustomSelectOption[]>(
    () => [
      { value: "", label: "All Departments" },
      ...departments.map((dept) => ({
        value: dept.id,
        label: `${dept.name} (${dept.code})`,
        badge: dept.code,
      })),
    ],
    [departments]
  );

  const academicYearOptions = React.useMemo<CustomSelectOption<number | "">[]>(
    () => [
      { value: "", label: "All Years" },
      { value: 1, label: "Year 1" },
      { value: 2, label: "Year 2" },
      { value: 3, label: "Year 3" },
      { value: 4, label: "Year 4" },
    ],
    []
  );

  const sortOptions = React.useMemo<CustomSelectOption[]>(
    () => [
      { value: "createdAt", label: "Date Enrolled" },
      { value: "name", label: "Full Name" },
      { value: "studentId", label: "Student ID" },
      { value: "department", label: "Department" },
      { value: "gpa", label: "GPA Score" },
      { value: "academicYear", label: "Academic Year" },
    ],
    []
  );

  const statusOptions = React.useMemo<CustomSelectOption[]>(
    () => [
      { value: "", label: "All Statuses" },
      { value: "ACTIVE", label: "Active" },
      { value: "INACTIVE", label: "Inactive" },
      { value: "SUSPENDED", label: "Suspended" },
      { value: "GRADUATED", label: "Graduated" },
    ],
    []
  );

  const gpaTierOptions = React.useMemo<CustomSelectOption[]>(
    () => [
      { value: "", label: "All Academic Standings" },
      { value: "deans_list", label: "Dean's List (GPA ≥ 3.50)" },
      { value: "good_standing", label: "Good Standing (GPA 2.50 – 3.49)" },
      { value: "probation", label: "Academic Probation (GPA < 2.00)" },
    ],
    []
  );

  return (
    <div className="w-full space-y-2 relative z-20 overflow-visible">
      {/* Primary Toolbar Container (Unified Single Row Across Mobile, Tablet & Desktop) */}
      <div className="relative flex flex-row items-center justify-between gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl border border-zinc-200/90 dark:border-white/10 hover:border-zinc-300/90 dark:hover:border-white/20 bg-white dark:bg-zinc-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_16px_-2px_rgba(0,0,0,0.06),0_2px_4px_-1px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_8px_16px_-3px_rgba(0,0,0,0.5),0_2px_6px_-1px_rgba(0,0,0,0.3)] transition-all overflow-visible min-h-10">
        {/* Left Section: Direct Parametric Filters */}
        <div className="flex flex-nowrap items-center gap-1.5 sm:gap-2 flex-1 min-w-0 overflow-visible">
          {/* Primary Filter 1: Department */}
          <CustomSelect
            value={departmentId}
            onChange={onDepartmentChange}
            options={departmentOptions}
            ariaLabel="Filter by department"
            placeholder="All Departments"
            className="min-w-0 flex-1 sm:flex-initial"
            triggerClassName="w-full sm:w-40 lg:w-44 truncate"
          />

          {/* Primary Filter 2: Academic Year */}
          <CustomSelect
            value={academicYear}
            onChange={(val) => onAcademicYearChange?.(val)}
            options={academicYearOptions}
            ariaLabel="Filter by academic year"
            placeholder="All Years"
            className="shrink-0"
            triggerClassName="w-24 sm:w-auto"
          />

          {/* Primary Filter 3: "More Filters" Popover Trigger */}
          <div className="relative inline-flex items-center shrink-0" ref={moreFiltersRef}>
            <button
              type="button"
              onClick={() => setIsMoreFiltersOpen((prev) => !prev)}
              aria-expanded={isMoreFiltersOpen}
              className={`tap-target inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs rounded-lg border cursor-pointer select-none transition-colors ${
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

            {/* "More Filters" Floating Popover Window */}
            <AnimatePresence>
              {isMoreFiltersOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 28,
                  }}
                  className="absolute top-full right-0 sm:right-auto sm:left-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] z-50 rounded-2xl shadow-2xl dark:shadow-[0_10px_20px_-4px_rgba(255,255,255,0.04),0_4px_8px_-2px_rgba(255,255,255,0.02),0_16px_32px_rgba(0,0,0,0.8)] bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-white/15 p-3.5 space-y-3.5 text-xs font-sans"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-white/5">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono text-[11px] uppercase tracking-wider">
                      Filters & Options
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
                        Reset All
                      </button>
                    )}
                  </div>

                  {/* Mobile-Only Sorting Controls (< sm) */}
                  <div className="sm:hidden space-y-2 pb-2 border-b border-zinc-100 dark:border-white/5">
                    <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                      Sort Records
                    </label>
                    <div className="flex items-center gap-1.5">
                      <CustomSelect
                        value={sortBy}
                        onChange={onSortByChange}
                        options={sortOptions}
                        className="flex-1 min-w-0"
                        triggerClassName="w-full justify-between"
                        ariaLabel="Sort records by"
                      />
                      <button
                        type="button"
                        onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
                        aria-label="Toggle sort order"
                        className="tap-target p-1.5 rounded-lg border border-zinc-200/80 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 cursor-pointer shrink-0"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 1. Status Filter */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                      Enrollment Status
                    </label>
                    <CustomSelect
                      value={status}
                      onChange={onStatusChange}
                      options={statusOptions}
                      className="w-full"
                      triggerClassName="w-full justify-between bg-zinc-50 dark:bg-zinc-900"
                      placeholder="All Statuses"
                      ariaLabel="Filter by enrollment status"
                    />
                  </div>

                  {/* 2. GPA Standing Tier Filter */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                      Academic Standing (GPA)
                    </label>
                    <CustomSelect
                      value={gpaTier}
                      onChange={(val) => onGpaTierChange?.(val)}
                      options={gpaTierOptions}
                      className="w-full"
                      triggerClassName="w-full justify-between bg-zinc-50 dark:bg-zinc-900"
                      placeholder="All Academic Standings"
                      ariaLabel="Filter by academic standing"
                    />
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

                  {/* Mobile-Only Actions: Refresh & Export (< sm) */}
                  <div className="sm:hidden pt-2 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onRefresh();
                        setIsMoreFiltersOpen(false);
                      }}
                      disabled={isLoading}
                      className="tap-target flex-1 py-1.5 px-2 rounded-lg border border-zinc-200/80 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                      <span>Sync</span>
                    </button>
                    {onExport && (
                      <button
                        type="button"
                        onClick={() => {
                          onExport();
                          setIsMoreFiltersOpen(false);
                        }}
                        disabled={isExporting}
                        className="tap-target flex-1 py-1.5 px-2 rounded-lg border border-zinc-200/80 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                      >
                        <Download className={`w-3.5 h-3.5 ${isExporting ? "animate-pulse" : ""}`} />
                        <span>Export CSV</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Section: View & Output Controls (Visible on >= sm: Tablet & Desktop) */}
        <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 shrink-0 border-l border-zinc-200/80 dark:border-white/10 pl-2 sm:pl-2.5">
          {/* Sorting Control */}
          <div className="flex items-center gap-1 shrink-0">
            <CustomSelect
              value={sortBy}
              onChange={onSortByChange}
              options={sortOptions}
              align="right"
              ariaLabel="Sort records by"
            />

            <Tooltip
              content={sortOrder === "asc" ? "Sort Ascending" : "Sort Descending"}
              subContent={`Currently sorting ${sortOrder.toUpperCase()}`}
              side="top"
            >
              <button
                type="button"
                onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
                aria-label="Toggle sort order"
                className="tap-target p-1.5 rounded-lg border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 cursor-pointer transition-colors shrink-0"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Realtime Live Sync Badge */}
            {isLiveSync && (
              <div
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono tracking-tight shrink-0"
                title="Connected to Supabase Realtime WebSocket"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">Live Sync</span>
                <span className="sm:hidden">Live</span>
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
      </div>

      {/* Internal active chips fallback if showActiveChips is true */}
      {showActiveChips && (
        <ActiveFilterChips
          search={search}
          onClearSearch={onClearSearch}
          departmentId={departmentId}
          onDepartmentChange={onDepartmentChange}
          academicYear={academicYear}
          onAcademicYearChange={onAcademicYearChange}
          status={status}
          onStatusChange={onStatusChange}
          gpaTier={gpaTier}
          onGpaTierChange={onGpaTierChange}
          includeArchived={includeArchived}
          onIncludeArchivedChange={onIncludeArchivedChange}
          departments={departments}
          onResetFilters={onResetFilters}
        />
      )}
    </div>
  );
}
