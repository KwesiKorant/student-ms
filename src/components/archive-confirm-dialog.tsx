"use client";

import * as React from "react";
import { Student } from "@/types/student";
import { useToast } from "@/components/ui/toast";
import {
  Archive,
  AlertTriangle,
  Trash2,
  X,
  Loader2,
} from "lucide-react";

interface ArchiveConfirmDialogProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onArchived: (archivedStudent: Student, isHardDeleted: boolean) => void;
}

export function ArchiveConfirmDialog({
  student,
  isOpen,
  onClose,
  onArchived,
}: ArchiveConfirmDialogProps) {
  const { toast } = useToast();
  const [isHardDelete, setIsHardDelete] = React.useState(false);
  const [confirmInput, setConfirmInput] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setIsHardDelete(false);
    setConfirmInput("");
    setErrorMessage(null);
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  const canHardDelete = confirmInput.trim() === student.studentId;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const url = `/api/v1/students/${student.id}${isHardDelete ? "?hard=true" : ""}`;
      const res = await fetch(url, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Failed to process record archival.");
        return;
      }

      if (isHardDelete) {
        toast({
          type: "info",
          title: "Record Permanently Deleted",
          description: `Student ${student.firstName} ${student.lastName} (${student.studentId}) was permanently removed.`,
        });
        onArchived(student, true);
      } else {
        toast({
          type: "success",
          title: "Student Safely Archived",
          description: `Profile hidden from active directory. Audit trail recorded.`,
        });
        onArchived(data.data, false);
      }

      onClose();
    } catch {
      setErrorMessage("Network error during archival request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-backdrop-enter"
      />

      {/* Dialog Card */}
      <div className="relative w-full max-w-md rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-2xl p-6 z-10 animate-modal-enter text-zinc-900 dark:text-zinc-100 isolated-card my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isHardDelete
                  ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
              }`}
            >
              {isHardDelete ? (
                <Trash2 className="w-5 h-5" />
              ) : (
                <Archive className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 id="archive-dialog-title" className="text-sm font-semibold tracking-tight">
                {isHardDelete ? "Confirm Hard Deletion" : "Archive Student Record"}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Institutional Lifecycle Protection
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Student Summary Callout */}
        <div className="mt-4 p-3 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50/70 dark:bg-zinc-850/70 text-xs space-y-1">
          <div className="flex items-center justify-between font-mono">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {student.firstName} {student.lastName}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px]">
              {student.studentId}
            </span>
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            {student.department?.name || "Department"} · {student.email}
          </div>
        </div>

        {/* Informative Body Copy */}
        <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {isHardDelete ? (
            <p className="text-rose-600 dark:text-rose-400 font-medium">
              Warning: Hard deletion physically purges this student profile and cascades all associated audit records. This action cannot be reversed.
            </p>
          ) : (
            <p>
              Archiving hides this student from the active directory. All enrollment history and audit trails remain preserved and can be restored at any time.
            </p>
          )}
        </div>

        {/* Optional Hard Delete Toggle */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-white/5">
          <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isHardDelete}
              onChange={(e) => {
                setIsHardDelete(e.target.checked);
                setConfirmInput("");
              }}
              className="rounded border-zinc-300 dark:border-zinc-700 text-rose-600 focus:ring-rose-500 cursor-pointer"
            />
            <span className="text-[11px]">
              Switch to permanent hard deletion (destructive)
            </span>
          </label>

          {isHardDelete && (
            <div className="mt-3 space-y-1.5">
              <label className="block text-[11px] font-mono text-zinc-500">
                Type <strong className="text-zinc-900 dark:text-zinc-100">{student.studentId}</strong> to confirm:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder={student.studentId}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-rose-300 dark:border-rose-900 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500 shadow-xs"
              />
            </div>
          )}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-3 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 mt-4 border-t border-zinc-100 dark:border-white/5 text-xs">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="tap-target px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || (isHardDelete && !canHardDelete)}
            className={`tap-target inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-medium shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isHardDelete
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-amber-600 hover:bg-amber-700 text-white"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : isHardDelete ? (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Delete</span>
              </>
            ) : (
              <>
                <Archive className="w-3.5 h-3.5" />
                <span>Archive Student</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
