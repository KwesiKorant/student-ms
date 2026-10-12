"use client";

import * as React from "react";
import { Student, AuditLog } from "@/types/student";
import {
  X,
  Edit2,
  Archive,
  RotateCcw,
  Calendar,
  Mail,
  Phone,
  GraduationCap,
  History,
  Clock,
  AlertTriangle,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import { motion } from "motion/react";
import { useModalDismiss } from "@/hooks/use-modal-dismiss";

interface StudentDetailModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (student: Student) => void;
  onArchive: (student: Student) => void;
  onRestore: (student: Student) => void;
}

export function StudentDetailModal({
  student,
  isOpen,
  onClose,
  onEdit,
  onArchive,
  onRestore,
}: StudentDetailModalProps) {
  const [activeTab, setActiveTab] = React.useState<"profile" | "audit">("profile");
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyText = (field: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  useModalDismiss(isOpen && !!student, onClose);

  if (!isOpen || !student) return null;

  const initials = `${student.firstName[0] || ""}${student.lastName[0] || ""}`.toUpperCase();

  const parseAuditDetails = (detailsStr: string) => {
    try {
      return JSON.parse(detailsStr);
    } catch {
      return { raw: detailsStr };
    }
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

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain"
    >
      {/* Backdrop - strictly zero blur for compositor efficiency */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        onClick={onClose}
        className="fixed inset-0 bg-black/75"
      />

      {/* Modal Dialog Card - bottom-sheet on mobile, centered card on desktop */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 12 }}
        transition={{
          type: "spring",
          stiffness: 380,
          damping: 30,
        }}
        className="relative w-full max-w-2xl rounded-t-3xl sm:rounded-2xl bg-white dark:bg-[#111114] border-t sm:border border-zinc-200/90 dark:border-white/10 shadow-2xl p-5 sm:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 z-10 text-zinc-900 dark:text-zinc-100 isolated-card my-0 sm:my-8 max-h-[92dvh] sm:max-h-[85vh] overflow-y-auto overscroll-contain"
      >
        {/* Mobile Visual Drag Handle */}
        <div className="sm:hidden w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-3 shrink-0" aria-hidden="true" />

        {/* Header Profile Bar */}
        <div className="flex items-start justify-between pb-5 border-b border-zinc-100 dark:border-white/5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-white/10 flex items-center justify-center font-mono text-base font-bold text-zinc-800 dark:text-zinc-200 shrink-0 shadow-xs">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="detail-modal-title" className="font-sans text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {student.firstName} {student.lastName}
                </h2>
                {getStatusBadge(student.status, student.isArchived)}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 inline-flex items-center gap-1.5">
                  {student.studentId}
                  <button
                    type="button"
                    onClick={() => copyText("studentId", student.studentId)}
                    title="Copy Student ID"
                    aria-label="Copy Student ID"
                    className="p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer transition-colors"
                  >
                    {copiedField === "studentId" ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </span>
                <span>·</span>
                <span>{student.department?.name || "Department"}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Archival Alert Notice (if archived) */}
        {student.isArchived && (
          <div className="mt-4 p-3 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                This student record is currently archived. Historical data and transcripts remain retained.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onRestore(student)}
              className="tap-target shrink-0 font-semibold underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-100 cursor-pointer"
            >
              Restore Record
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 mt-5 border-b border-zinc-100 dark:border-white/5 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`pb-2.5 px-1 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "profile"
                ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100"
                : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Academic Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`pb-2.5 px-1 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "audit"
                ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100"
                : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit History ({student.auditLogs?.length ?? 0})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-5 min-h-[220px]">
          {activeTab === "profile" ? (
            <div className="space-y-5 text-xs">
              {/* Academic Highlights Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-zinc-200/80 dark:border-white/10 bg-zinc-50/70 dark:bg-zinc-900/80">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px] font-mono block">Division</span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 block truncate">
                    {student.department?.name || "General"}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                    Code: {student.department?.code || "N/A"}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-zinc-200/80 dark:border-white/10 bg-zinc-50/70 dark:bg-zinc-900/80">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px] font-mono block">Standing</span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 block font-mono">
                    Year {student.academicYear}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                    Cohort {2026 - (student.academicYear - 1)}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-zinc-200/80 dark:border-white/10 bg-zinc-50/70 dark:bg-zinc-900/80">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px] font-mono block">Cumulative GPA</span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 block font-mono">
                    {student.gpa !== null && student.gpa !== undefined
                      ? student.gpa.toFixed(2)
                      : "Unassigned"}
                  </span>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, ((student.gpa || 0) / 4.0) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              {/* Demographics & Contact */}
              <div className="rounded-xl border border-zinc-200/80 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-900/50 p-4 space-y-3">
                <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  Demographic & Contact Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-mono">Email Address</span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200 inline-flex items-center gap-1.5 max-w-full">
                        <span className="truncate">{student.email}</span>
                        <button
                          type="button"
                          onClick={() => copyText("email", student.email)}
                          title="Copy email address"
                          aria-label="Copy email address"
                          className="p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer transition-colors shrink-0"
                        >
                          {copiedField === "email" ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
                    <div>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-mono">Phone Number</span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200">
                        {student.phone || "Not specified"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                    <div>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-mono">Date of Birth</span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200">
                        {student.dateOfBirth || "Not specified"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
                    <div>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-mono">Enrolled Since</span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Audit Log Trail */
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {(!student.auditLogs || student.auditLogs.length === 0) ? (
                <div className="py-8 text-center text-zinc-400 font-mono text-xs">
                  No historical audit entries captured for this student.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {student.auditLogs.map((log: AuditLog) => {
                    const details = parseAuditDetails(log.details);

                    return (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl border border-zinc-200/80 dark:border-white/10 bg-zinc-50/60 dark:bg-zinc-900/60 text-xs font-mono"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                log.action === "CREATE"
                                  ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40"
                                  : log.action === "UPDATE"
                                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/60"
                                  : log.action === "ARCHIVE"
                                  ? "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40"
                                  : "bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40"
                              }`}
                            >
                              {log.action}
                            </span>
                            <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                              by {log.performedBy}
                            </span>
                          </div>
                          <span className="text-zinc-400 text-[10px]">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>

                        {/* Expandable details view */}
                        <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-950/80 border border-zinc-200/60 dark:border-white/10 text-[11px] text-zinc-600 dark:text-zinc-300 overflow-x-auto">
                          {details.event && (
                            <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                              {details.event}
                            </p>
                          )}
                          {details.initialData && (
                            <div className="mt-1 flex flex-wrap gap-1.5 text-[10px]">
                              {details.initialData.status && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-white/10">
                                  Status: <strong className="text-zinc-900 dark:text-zinc-100">{details.initialData.status}</strong>
                                </span>
                              )}
                              {details.initialData.academicYear !== undefined && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-white/10">
                                  Year: <strong className="text-zinc-900 dark:text-zinc-100">{details.initialData.academicYear}</strong>
                                </span>
                              )}
                              {details.initialData.gpa !== undefined && details.initialData.gpa !== null && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-white/10">
                                  GPA: <strong className="text-zinc-900 dark:text-zinc-100">{Number(details.initialData.gpa).toFixed(2)}</strong>
                                </span>
                              )}
                            </div>
                          )}
                          {details.modifiedFields && (
                            <div className="space-y-0.5">
                              {Object.entries(
                                details.modifiedFields as Record<
                                  string,
                                  { from: unknown; to: unknown }
                                >
                              ).map(([field, delta]) => (
                                <div key={field} className="text-[10px]">
                                  <span className="text-zinc-400">{field}:</span>{" "}
                                  <span className="line-through text-rose-500 mr-1">
                                    {String(delta.from ?? "null")}
                                  </span>{" "}
                                  <span className="text-emerald-500 font-medium">
                                    → {String(delta.to ?? "null")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          {!details.modifiedFields && !details.initialData && !details.event && (
                            <pre className="text-[10px]">
                              {JSON.stringify(details, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-5 mt-4 border-t border-zinc-100 dark:border-white/5 text-xs">
          <div>
            {student.isArchived ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRestore(student);
                }}
                className="tap-target inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Student</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onArchive(student);
                }}
                className="tap-target inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-white/10 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer font-medium"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive Student</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="tap-target px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(student);
              }}
              className="tap-target inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
