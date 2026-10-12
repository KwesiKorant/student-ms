"use client";

import * as React from "react";
import { PaginationMeta } from "@/types/student";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
}

export function Pagination({
  pagination,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const { page, limit, totalPages, totalRecords } = pagination;

  const startRecord = totalRecords === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalRecords);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400 py-2">
      {/* Records count indicator */}
      <div className="font-mono text-center sm:text-left">
        Showing{" "}
        <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
          {startRecord}–{endRecord}
        </strong>{" "}
        of{" "}
        <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
          {totalRecords}
        </strong>{" "}
        students
      </div>

      <div className="flex items-center justify-between w-full sm:w-auto gap-3">
        {/* Page size dropdown */}
        <div className="flex items-center gap-1.5 font-mono">
          <span>Rows:</span>
          <div className="relative inline-flex items-center">
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              aria-label="Records per page"
              className="appearance-none pl-2.5 pr-6 py-1.5 text-xs rounded border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer min-h-[36px]"
            >
              <option value={10} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">10</option>
              <option value={25} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">25</option>
              <option value={50} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">50</option>
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-400 pointer-events-none absolute right-1.5" />
          </div>
        </div>

        {/* Page Controls */}
        <div className="flex items-center gap-1 font-mono">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
            className="tap-target min-h-[36px] min-w-[36px] p-2 flex items-center justify-center rounded border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="px-2.5 py-1 text-xs select-none">
            {page} / {totalPages || 1}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
            className="tap-target min-h-[36px] min-w-[36px] p-2 flex items-center justify-center rounded border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
