"use client";

import * as React from "react";
import { Department, EnrollmentStatus, Student } from "@/types/student";
import { CreateStudentSchema, MAX_STUDENT_DOB, MIN_STUDENT_DOB } from "@/lib/validations/student";
import { useToast } from "@/components/ui/toast";
import { X, UserPlus, AlertCircle, Loader2 } from "lucide-react";
import { useModalDismiss } from "@/hooks/use-modal-dismiss";
import { useMobileSheetDrag } from "@/hooks/use-mobile-sheet-drag";
import { motion } from "motion/react";

interface EnrollStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  onStudentCreated: (newStudent: Student) => void;
}

export function EnrollStudentModal({
  isOpen,
  onClose,
  departments,
  onStudentCreated,
}: EnrollStudentModalProps) {
  const { toast } = useToast();
  const { isMobile, dragControls, y, backdropOpacity, handleDragEnd } = useMobileSheetDrag(onClose);

  const [formData, setFormData] = React.useState({
    studentId: "",
    firstName: "",
    lastName: "",
    email: "",
    departmentId: "",
    academicYear: 1,
    gpa: "",
    dateOfBirth: "",
    phone: "",
    status: "ACTIVE" as EnrollmentStatus,
  });

  const [showManualId, setShowManualId] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  useModalDismiss(isOpen, onClose);

  const maxDob = MAX_STUDENT_DOB;
  const minDob = MIN_STUDENT_DOB;

  if (!isOpen) return null;

  const currentDepartmentId = formData.departmentId || departments[0]?.id || "";

  const validate = () => {
    const result = CreateStudentSchema.safeParse({
      ...formData,
      studentId: formData.studentId.trim() || undefined,
      departmentId: currentDepartmentId,
      academicYear: Number(formData.academicYear),
      gpa: formData.gpa === "" ? null : Number(formData.gpa),
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0] as string;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        departmentId: currentDepartmentId,
        academicYear: Number(formData.academicYear),
        gpa: formData.gpa === "" ? null : Number(formData.gpa),
        dateOfBirth: formData.dateOfBirth || undefined,
        phone: formData.phone.trim() || undefined,
        status: formData.status,
      };

      if (formData.studentId.trim()) {
        payload.studentId = formData.studentId.trim().toUpperCase();
      }

      const res = await fetch("/api/v1/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setServerError(
            data.message || "A student with this institutional email is already enrolled."
          );
        } else if (res.status === 429) {
          setServerError("Rate limit exceeded. Please wait a moment before trying again.");
        } else if (data.details) {
          const detailErrors: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(data.details)) {
            detailErrors[key] = (msgs as string[])[0];
          }
          setErrors(detailErrors);
        } else {
          setServerError(data.message || "Failed to enroll student.");
        }
        return;
      }

      toast({
        type: "success",
        title: "Student Enrolled Successfully",
        description: `${data.data.firstName} ${data.data.lastName} enrolled with ID ${data.data.studentId}.`,
      });

      onStudentCreated(data.data);
      onClose();
    } catch {
      setServerError("Network connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="enroll-modal-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain"
    >
      {/* Backdrop - strictly zero blur for compositor efficiency, reactive to drag displacement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        style={isMobile ? { opacity: backdropOpacity } : undefined}
        onClick={onClose}
        className="fixed inset-0 bg-black/75"
      />

      {/* Modal Dialog Card - draggable bottom-sheet on mobile, centered card on desktop */}
      <motion.div
        drag={isMobile ? "y" : false}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.75 }}
        dragSnapToOrigin
        onDragEnd={handleDragEnd}
        style={isMobile ? { y } : undefined}
        initial={isMobile ? { y: "100%", opacity: 1 } : { opacity: 0, scale: 0.98, y: 16 }}
        animate={isMobile ? { y: 0, opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        exit={isMobile ? { y: "100%", opacity: 0 } : { opacity: 0, scale: 0.98, y: 12 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 32,
        }}
        className="relative w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-white dark:bg-[#111114] border-t sm:border border-zinc-200/90 dark:border-white/10 shadow-2xl p-5 sm:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 z-10 text-zinc-900 dark:text-zinc-100 isolated-card my-0 sm:my-8 max-h-[92dvh] sm:max-h-[85vh] overflow-y-auto overscroll-contain"
      >
        {/* Ergonomic Mobile Drag Handle Zone (Min 44px touch target) */}
        <div
          onPointerDown={(e) => {
            if (isMobile && e.isPrimary) {
              dragControls.start(e);
            }
          }}
          className="sm:hidden flex items-center justify-center w-full py-3.5 -mt-2 mb-2 cursor-grab active:cursor-grabbing touch-none select-none group"
          aria-label="Drag down to dismiss"
          role="button"
          tabIndex={-1}
        >
          <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full transition-all group-active:bg-zinc-400 dark:group-active:bg-zinc-500 group-active:scale-x-110" />
        </div>

        {/* Header */}
        <div
          onPointerDown={(e) => {
            if (isMobile && e.isPrimary) {
              const target = e.target as HTMLElement;
              if (!target.closest("button") && !target.closest("a") && !target.closest("input")) {
                dragControls.start(e);
              }
            }
          }}
          className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-white/5 touch-none sm:touch-auto cursor-grab active:cursor-grabbing sm:cursor-default"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-white/10 flex items-center justify-center text-zinc-800 dark:text-zinc-200">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 id="enroll-modal-title" className="font-display text-sm font-semibold tracking-tight">
                Enroll New Student
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Official institutional registry record creation
              </p>
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

        {/* Server Error Alert Banner */}
        {serverError && (
          <div className="mt-4 p-3 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Row 1: Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                autoComplete="given-name"
                autoCapitalize="words"
                spellCheck={false}
                maxLength={50}
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="e.g. Kwame"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200/90 dark:border-white/10 bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 shadow-xs transition-colors"
              />
              {errors.firstName && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                autoComplete="family-name"
                autoCapitalize="words"
                spellCheck={false}
                maxLength={50}
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="e.g. Mensah"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200/90 dark:border-white/10 bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 shadow-xs transition-colors"
              />
              {errors.lastName && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Row 2: Email */}
          <div>
            <label className="block font-medium mb-1 text-zinc-700 dark:text-zinc-300">
              Institutional Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              inputMode="email"
              required
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={100}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="e.g. kwame.mensah@university.edu"
              className="w-full px-3 py-2 rounded-lg border border-zinc-200/90 dark:border-white/10 bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 shadow-xs transition-colors"
            />
            {errors.email && (
              <p className="mt-1 text-[11px] text-rose-500">{errors.email}</p>
            )}
          </div>

          {/* Row 3: Department & Academic Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={currentDepartmentId}
                onChange={(e) =>
                  setFormData({ ...formData, departmentId: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-zinc-200/90 dark:border-white/10 bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 shadow-xs cursor-pointer transition-colors"
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
              {errors.departmentId && (
                <p className="mt-1 text-[11px] text-rose-500">
                  {errors.departmentId}
                </p>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                Academic Year <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.academicYear}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    academicYear: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-zinc-200/90 dark:border-white/10 bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 shadow-xs cursor-pointer transition-colors"
              >
                {[1, 2, 3, 4, 5, 6].map((yr) => (
                  <option key={yr} value={yr}>
                    Year {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: GPA & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                GPA Score (0.00 – 4.00)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.00"
                max="4.00"
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                value={formData.gpa}
                onChange={(e) =>
                  setFormData({ ...formData, gpa: e.target.value })
                }
                placeholder="e.g. 3.82"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200/90 dark:border-white/10 bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 shadow-xs transition-colors"
              />
              {errors.gpa && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.gpa}</p>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                Enrollment Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as EnrollmentStatus,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-zinc-200/90 dark:border-white/10 bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 shadow-xs cursor-pointer transition-colors"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="GRADUATED">GRADUATED</option>
              </select>
            </div>
          </div>

          {/* Row 5: Date of Birth & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                Date of Birth (Optional)
              </label>
              <input
                type="date"
                min={minDob}
                max={maxDob}
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-zinc-200/90 dark:border-white/10 bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 shadow-xs transition-colors"
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-[11px] text-rose-500">
                  {errors.dateOfBirth}
                </p>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={25}
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="e.g. +1-555-0142"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200/90 dark:border-white/10 bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 shadow-xs transition-colors"
              />
              {errors.phone && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Row 6: Student ID Management (Auto vs Manual) */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-zinc-700 dark:text-zinc-300 text-[11px]">
                Student Identifier (STU-ID)
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowManualId(!showManualId);
                  if (showManualId) {
                    setFormData({ ...formData, studentId: "" });
                  }
                }}
                className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-2 cursor-pointer transition-colors"
              >
                {showManualId ? "Switch to Auto-Generated" : "Specify Custom ID"}
              </button>
            </div>
            {showManualId ? (
              <div>
                <input
                  type="text"
                  maxLength={13}
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      studentId: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="STU-2026-XXXX (Hex)"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200/90 dark:border-white/10 bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 shadow-xs uppercase tracking-wider transition-colors"
                />
                {errors.studentId && (
                  <p className="mt-1 text-[11px] text-rose-500">{errors.studentId}</p>
                )}
                <p className="mt-0.5 text-[10px] text-zinc-400 font-mono">
                  Standard format: STU-YYYY-[HEX4] (e.g. STU-2026-4F1A)
                </p>
              </div>
            ) : (
              <div className="px-3 py-2 rounded-lg border border-dashed border-zinc-200 dark:border-white/10 bg-zinc-50/40 dark:bg-zinc-900/40 text-zinc-500 text-[11px] font-mono flex items-center justify-between">
                <span>Auto-generated institutional format: STU-2026-[HEX]</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  AUTO
                </span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="tap-target px-3 py-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="tap-target inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Enrolling...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Enroll Student</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
