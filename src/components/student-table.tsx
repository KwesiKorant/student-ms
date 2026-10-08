"use client";

import * as React from "react";
import { Student } from "@/types/student";
import {
  Eye,
  Edit2,
  Archive,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  GraduationCap,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

interface StudentTableProps {
  students: Student[];
  isLoading: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
  onViewStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onArchiveStudent: (student: Student) => void;
  onRestoreStudent: (student: Student) => void;
  onOpenEnrollModal: () => void;
}

export function StudentTable({
  students,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onViewStudent,
  onEditStudent,
  onArchiveStudent,
  onRestoreStudent,
  onOpenEnrollModal,
}: StudentTableProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string, isArchived: boolean) => {
    if (isArchived) {
      return (
        <Tooltip content="Archived Record" subContent="Preserved in soft-archival tier" side="top">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 cursor-help">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            ARCHIVED
          </span>
        </Tooltip>
      );
    }

    switch (status) {
      case "ACTIVE":
        return (
          <Tooltip content="Active Enrollment" subContent="Student enrolled in good standing" side="top">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 cursor-help">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              ACTIVE
            </span>
          </Tooltip>
        );
      case "SUSPENDED":
        return (
          <Tooltip content="Disciplinary Suspension" subContent="Academic registration hold active" side="top">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 cursor-help">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              SUSPENDED
            </span>
          </Tooltip>
        );
      case "GRADUATED":
        return (
          <Tooltip content="Program Graduate" subContent="Degree conferred successfully" side="top">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 cursor-help">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              GRADUATED
            </span>
          </Tooltip>
        );
      default:
        return (
          <Tooltip content="Inactive Registration" subContent="Candidate not registered for active term" side="top">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border border-zinc-500/20 cursor-help">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              INACTIVE
            </span>
          </Tooltip>
        );
    }
  };

  const getGpaColor = (gpa: number | null | undefined) => {
    if (gpa === null || gpa === undefined) return "text-zinc-400";
    if (gpa >= 3.5) return "text-emerald-600 dark:text-emerald-400 font-semibold";
    if (gpa >= 3.0) return "text-blue-600 dark:text-blue-400 font-medium";
    if (gpa >= 2.0) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400 font-semibold";
  };

  if (isLoading) {
    return (
      <div className="w-full rounded-xl glass-card overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between text-xs text-zinc-400">
          <div className="h-4 w-32 bg-zinc-200/70 dark:bg-zinc-800/70 rounded animate-pulse" />
          <div className="h-4 w-20 bg-zinc-200/70 dark:bg-zinc-800/70 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-zinc-100/60 dark:divide-white/5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-zinc-200/70 dark:bg-zinc-800/70 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-36 bg-zinc-200/70 dark:bg-zinc-800/70 rounded animate-pulse" />
                  <div className="h-2.5 w-48 bg-zinc-100/70 dark:bg-zinc-850/70 rounded animate-pulse" />
                </div>
              </div>
              <div className="hidden sm:block h-3.5 w-24 bg-zinc-200/70 dark:bg-zinc-800/70 rounded animate-pulse" />
              <div className="h-5 w-16 bg-zinc-200/70 dark:bg-zinc-800/70 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="w-full rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/30 p-12 text-center">
        <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          No matching records in registry
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
          No student profiles match your search or filter configuration. Reset filters or enroll a new candidate.
        </p>
        <button
          type="button"
          onClick={onOpenEnrollModal}
          className="tap-target mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 transition-colors cursor-pointer"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Enroll New Student
        </button>
      </div>
    );
  }

  const renderSortHeader = (label: string, field: string, className = "") => {
    const isCurrent = sortBy === field;
    return (
      <th
        className={`py-3 px-4 ${className} ${onSort ? "cursor-pointer select-none hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" : ""}`}
        onClick={() => onSort?.(field)}
        aria-sort={isCurrent ? (sortOrder === "asc" ? "ascending" : "descending") : undefined}
      >
        <div className="inline-flex items-center gap-1.5 cursor-pointer">
          <span>{label}</span>
          {isCurrent ? (
            sortOrder === "asc" ? (
              <ArrowUp className="w-3 h-3 text-zinc-900 dark:text-zinc-100" />
            ) : (
              <ArrowDown className="w-3 h-3 text-zinc-900 dark:text-zinc-100" />
            )
          ) : onSort ? (
            <ArrowUpDown className="w-2.5 h-2.5 opacity-30 hover:opacity-100 transition-opacity" />
          ) : null}
        </div>
      </th>
    );
  };

  return (
    <div className="w-full rounded-xl glass-card overflow-hidden isolated-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200/80 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02] text-[10px] font-mono tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
              {renderSortHeader("Student ID", "studentId")}
              {renderSortHeader("Candidate Profile", "name")}
              {renderSortHeader("Department", "department", "hidden md:table-cell")}
              {renderSortHeader("Year", "academicYear", "hidden sm:table-cell")}
              {renderSortHeader("GPA", "gpa")}
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-white/5 text-xs">
            {students.map((student) => {
              const initials = `${student.firstName[0] || ""}${student.lastName[0] || ""}`.toUpperCase();

              return (
                <tr
                  key={student.id}
                  onClick={() => onViewStudent(student)}
                  className={`group hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors duration-150 cursor-pointer select-none ${
                    student.isArchived ? "opacity-65 bg-zinc-50/40 dark:bg-zinc-950/20" : ""
                  }`}
                >
                  {/* Student ID */}
                  <td className="py-3 px-4 font-mono whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {student.studentId}
                      </span>
                      <Tooltip
                        content={copiedId === student.studentId ? "Copied!" : "Copy Student ID"}
                        subContent={copiedId === student.studentId ? "Copied to clipboard" : "Click to copy STU-ID"}
                        side="top"
                      >
                        <button
                          type="button"
                          onClick={(e) => copyToClipboard(student.studentId, e)}
                          aria-label="Copy student ID"
                          className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 transition-opacity cursor-pointer"
                        >
                          {copiedId === student.studentId ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </Tooltip>
                    </div>
                  </td>

                  {/* Student Profile (Avatar + Name + Email) */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5 min-w-[160px]">
                      <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-white/10 flex items-center justify-center font-mono text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate font-mono">
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="py-3 px-4 hidden md:table-cell whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-white/10">
                        {student.department?.code || "GEN"}
                      </span>
                      <span className="text-zinc-600 dark:text-zinc-300 text-xs truncate max-w-[150px]">
                        {student.department?.name || "General"}
                      </span>
                    </div>
                  </td>

                  {/* Academic Year */}
                  <td className="py-3 px-4 hidden sm:table-cell whitespace-nowrap font-mono text-zinc-600 dark:text-zinc-300">
                    Year {student.academicYear}
                  </td>

                  {/* GPA */}
                  <td className="py-3 px-4 whitespace-nowrap font-mono">
                    <span className={getGpaColor(student.gpa)}>
                      {student.gpa !== null && student.gpa !== undefined
                        ? student.gpa.toFixed(2)
                        : "—"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getStatusBadge(student.status, student.isArchived)}
                  </td>

                  {/* Actions Column */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div
                      className="inline-flex items-center gap-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Tooltip content="Inspect Candidate" subContent="View record details & audit logs" side="left">
                        <button
                          type="button"
                          onClick={() => onViewStudent(student)}
                          aria-label={`View profile for ${student.firstName} ${student.lastName}`}
                          className="tap-target p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>

                      <Tooltip content="Edit Record" subContent="Modify student information" side="left">
                        <button
                          type="button"
                          onClick={() => onEditStudent(student)}
                          aria-label={`Edit profile for ${student.firstName} ${student.lastName}`}
                          className="tap-target p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>

                      {student.isArchived ? (
                        <Tooltip content="Restore Record" subContent="Re-activate student profile" side="left">
                          <button
                            type="button"
                            onClick={() => onRestoreStudent(student)}
                            aria-label={`Restore student profile for ${student.firstName} ${student.lastName}`}
                            className="tap-target p-1.5 rounded-md text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>
                      ) : (
                        <Tooltip content="Archive Record" subContent="Preserve in soft-archival tier" side="left">
                          <button
                            type="button"
                            onClick={() => onArchiveStudent(student)}
                            aria-label={`Archive student record for ${student.firstName} ${student.lastName}`}
                            className="tap-target p-1.5 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
