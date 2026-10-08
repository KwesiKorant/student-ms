"use client";

import * as React from "react";
import { Department } from "@/types/student";
import {
  Search,
  X,
  RotateCw,
  Archive,
  ArrowUpDown,
  Filter,
} from "lucide-react";

interface ToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  departmentId: string;
  onDepartmentChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
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
}

export function Toolbar({
  search,
  onSearchChange,
  departmentId,
  onDepartmentChange,
  status,
  onStatusChange,
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
}: ToolbarProps) {
  // Sync prop changes during render without cascading useEffect renders
  const [prevSearch, setPrevSearch] = React.useState(search);
  const [localSearch, setLocalSearch] = React.useState(search);

  if (search !== prevSearch) {
    setPrevSearch(search);
    setLocalSearch(search);
  }

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [localSearch, search, onSearchChange]);

  const hasActiveFilters =
    search.trim() !== "" ||
    departmentId !== "" ||
    status !== "" ||
    includeArchived;

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[260px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search students by name, email, or ID (e.g. STU-2026)..."
            className="w-full pl-9 pr-9 py-2 text-xs md:text-sm rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all shadow-xs"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              title="Clear search query"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <select
            value={departmentId}
            onChange={(e) => onDepartmentChange(e.target.value)}
            aria-label="Filter by department"
            className="px-2.5 py-2 text-xs rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer shadow-xs"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name} ({dept.code})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Filter by enrollment status"
            className="px-2.5 py-2 text-xs rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer shadow-xs"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="GRADUATED">Graduated</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            aria-label="Sort records by"
            className="hidden sm:inline-block px-2.5 py-2 text-xs rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer shadow-xs"
          >
            <option value="createdAt">Date Enrolled</option>
            <option value="name">Full Name</option>
            <option value="studentId">Student ID</option>
            <option value="department">Department</option>
            <option value="gpa">GPA Score</option>
            <option value="academicYear">Academic Year</option>
          </select>

          {/* Sort Order Toggle */}
          <button
            type="button"
            onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
            title={`Sort order: ${sortOrder.toUpperCase()} (Click to toggle)`}
            aria-label={`Toggle sort direction, currently ${sortOrder.toUpperCase()}`}
            className="tap-target inline-flex items-center gap-1 px-2.5 py-2 text-xs rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer shadow-xs"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px] uppercase">{sortOrder}</span>
          </button>

          {/* Include Archived Toggle */}
          <label className="tap-target inline-flex items-center gap-1.5 px-2.5 py-2 text-xs rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer select-none shadow-xs">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => onIncludeArchivedChange(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-500 cursor-pointer"
            />
            <Archive className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[11px]">Archived</span>
          </label>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh student records"
            aria-label="Refresh student records"
            className="tap-target p-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Active Filter Badges & Reset Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-zinc-400 text-[11px] font-mono flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Filters:
          </span>

          {search.trim() !== "" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] border border-zinc-200 dark:border-white/10">
              Query: &quot;{search}&quot;
              <button
                onClick={() => onSearchChange("")}
                className="hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {departmentId !== "" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] border border-zinc-200 dark:border-white/10">
              Dept: {departments.find((d) => d.id === departmentId)?.code || departmentId}
              <button
                onClick={() => onDepartmentChange("")}
                className="hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {status !== "" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] border border-zinc-200 dark:border-white/10">
              Status: {status}
              <button
                onClick={() => onStatusChange("")}
                className="hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {includeArchived && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[11px] border border-amber-200 dark:border-amber-800/40">
              Showing Archived
              <button
                onClick={() => onIncludeArchivedChange(false)}
                className="hover:text-amber-900 dark:hover:text-amber-200 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-2 ml-1 cursor-pointer"
          >
            Reset all
          </button>
        </div>
      )}
    </div>
  );
}
