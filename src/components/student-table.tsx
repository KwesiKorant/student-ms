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
} from "lucide-react";

interface StudentTableProps {
  students: Student[];
  isLoading: boolean;
  onViewStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onArchiveStudent: (student: Student) => void;
  onRestoreStudent: (student: Student) => void;
  onOpenEnrollModal: () => void;
}

export function StudentTable({
  students,
  isLoading,
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
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
          ARCHIVED
        </span>
      );
    }

    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
            ACTIVE
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
            SUSPENDED
          </span>
        );
      case "GRADUATED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
            GRADUATED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10">
            INACTIVE
          </span>
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
      <div className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between text-xs text-zinc-400">
          <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-white/5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-36 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="h-2.5 w-48 bg-zinc-100 dark:bg-zinc-850 rounded animate-pulse" />
                </div>
              </div>
              <div className="hidden sm:block h-3.5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="w-full rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 p-12 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          No student profiles found
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
          No records match your active search terms or filters. Try adjusting your filter parameters or enroll a new student.
        </p>
        <button
          type="button"
          onClick={onOpenEnrollModal}
          className="tap-target mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm cursor-pointer"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Enroll New Student
        </button>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-xs isolated-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-white/10 bg-zinc-50/75 dark:bg-zinc-950/75 text-[11px] font-mono tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
              <th className="py-3 px-4">Student ID</th>
              <th className="py-3 px-4">Student Profile</th>
              <th className="py-3 px-4 hidden md:table-cell">Department</th>
              <th className="py-3 px-4 hidden sm:table-cell">Year</th>
              <th className="py-3 px-4">GPA</th>
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
                  className={`group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer select-none ${
                    student.isArchived ? "opacity-75 bg-zinc-50/40 dark:bg-zinc-950/30" : ""
                  }`}
                >
                  {/* Student ID */}
                  <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {student.studentId}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => copyToClipboard(student.studentId, e)}
                        title="Copy student ID"
                        className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 transition-opacity cursor-pointer"
                      >
                        {copiedId === student.studentId ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Student Profile (Avatar + Name + Email) */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5 min-w-[160px]">
                      <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 flex items-center justify-center font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1.5">
                          <span>
                            {student.firstName} {student.lastName}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate font-mono">
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="py-3.5 px-4 hidden md:table-cell whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10">
                        {student.department?.code || "GEN"}
                      </span>
                      <span className="text-zinc-600 dark:text-zinc-300 text-xs truncate max-w-[150px]">
                        {student.department?.name || "General"}
                      </span>
                    </div>
                  </td>

                  {/* Academic Year */}
                  <td className="py-3.5 px-4 hidden sm:table-cell whitespace-nowrap font-mono text-zinc-600 dark:text-zinc-300">
                    Year {student.academicYear}
                  </td>

                  {/* GPA */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                    <span className={getGpaColor(student.gpa)}>
                      {student.gpa !== null && student.gpa !== undefined
                        ? student.gpa.toFixed(2)
                        : "—"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(student.status, student.isArchived)}
                  </td>

                  {/* Actions Column */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div
                      className="inline-flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onViewStudent(student)}
                        title="View profile details"
                        className="tap-target p-1.5 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditStudent(student)}
                        title="Edit student record"
                        className="tap-target p-1.5 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {student.isArchived ? (
                        <button
                          type="button"
                          onClick={() => onRestoreStudent(student)}
                          title="Restore student profile"
                          className="tap-target p-1.5 rounded text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onArchiveStudent(student)}
                          title="Archive student record"
                          className="tap-target p-1.5 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
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
