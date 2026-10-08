"use client";

import * as React from "react";
import { PaginationMeta } from "@/types/student";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

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
      <Tooltip
        content="Current Position"
        subContent={`${totalRecords} total student records indexed`}
        side="top"
      >
        <div className="font-mono cursor-default">
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
      </Tooltip>

      <div className="flex items-center gap-3">
        {/* Page size dropdown */}
        <Tooltip
          content="Rows Per Page"
          subContent="Adjust candidate density in table view"
          side="top"
        >
          <div className="flex items-center gap-1.5 font-mono">
            <span>Rows:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              aria-label="Records per page"
              className="px-2 py-1 text-xs rounded border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </Tooltip>

        {/* Page Controls */}
        <div className="flex items-center gap-1 font-mono">
          <Tooltip
            content="Previous Page"
            subContent={page > 1 ? `Navigate to page ${page - 1}` : "Already on first page"}
            side="top"
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              aria-label="Previous page"
              className="tap-target p-1.5 rounded border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <span className="px-2.5 py-1 text-xs select-none">
            {page} / {totalPages || 1}
          </span>

          <Tooltip
            content="Next Page"
            subContent={page < totalPages ? `Navigate to page ${page + 1}` : "Already on last page"}
            side="top"
          >
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              aria-label="Next page"
              className="tap-target p-1.5 rounded border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
