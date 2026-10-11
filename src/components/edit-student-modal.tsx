"use client";

import * as React from "react";
import { Department, EnrollmentStatus, Student } from "@/types/student";
import { UpdateStudentSchema } from "@/lib/validations/student";
import { useToast } from "@/components/ui/toast";
import { X, Edit2, AlertCircle, Loader2 } from "lucide-react";
import { useModalDismiss } from "@/hooks/use-modal-dismiss";

interface EditStudentModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  onStudentUpdated: (updated: Student) => void;
}

export function EditStudentModal({
  student,
  isOpen,
  onClose,
  departments,
  onStudentUpdated,
}: EditStudentModalProps) {
  const { toast } = useToast();

  const [formData, setFormData] = React.useState({
    firstName: student?.firstName ?? "",
    lastName: student?.lastName ?? "",
    email: student?.email ?? "",
    departmentId: student?.departmentId ?? "",
    academicYear: student?.academicYear ?? 1,
    gpa: student?.gpa !== null && student?.gpa !== undefined ? String(student.gpa) : "",
    dateOfBirth: student?.dateOfBirth ?? "",
    phone: student?.phone ?? "",
    status: (student?.status ?? "ACTIVE") as EnrollmentStatus,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  useModalDismiss(isOpen && !!student, onClose);

  if (!isOpen || !student) return null;

  const validate = () => {
    const result = UpdateStudentSchema.safeParse({
      ...formData,
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
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        departmentId: formData.departmentId,
        academicYear: Number(formData.academicYear),
        gpa: formData.gpa === "" ? null : Number(formData.gpa),
        dateOfBirth: formData.dateOfBirth || undefined,
        phone: formData.phone.trim() || undefined,
        status: formData.status,
      };

      const res = await fetch(`/api/v1/students/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setServerError(data.message || "A student with this email address already exists.");
        } else if (res.status === 429) {
          setServerError("Rate limit exceeded. Please wait a moment before trying again.");
        } else if (data.details) {
          const detailErrors: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(data.details)) {
            detailErrors[key] = (msgs as string[])[0];
          }
          setErrors(detailErrors);
        } else {
          setServerError(data.message || "Failed to update student profile.");
        }
        return;
      }

      toast({
        type: "success",
        title: "Record Updated",
        description: `Profile for ${data.data.firstName} ${data.data.lastName} updated successfully.`,
      });

      onStudentUpdated(data.data);
      onClose();
    } catch {
      setServerError("Network connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* Backdrop - strictly zero blur for compositor efficiency */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 animate-backdrop-enter"
      />

      {/* Modal Dialog Card - fully opaque in light and dark mode to prevent any text bleed */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#111114] border border-zinc-200/90 dark:border-white/10 shadow-2xl p-6 z-10 animate-modal-enter text-zinc-900 dark:text-zinc-100 isolated-card my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-white/10 flex items-center justify-center text-zinc-800 dark:text-zinc-200">
              <Edit2 className="w-4 h-4" />
            </div>
            <div>
              <h2 id="edit-modal-title" className="text-sm font-semibold tracking-tight">
                Edit Student Profile
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                {student.studentId} · {student.firstName} {student.lastName}
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
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
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
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
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
              required
              autoComplete="email"
              spellCheck={false}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
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
                value={formData.departmentId}
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
                step="0.01"
                min="0.00"
                max="4.00"
                value={formData.gpa}
                onChange={(e) =>
                  setFormData({ ...formData, gpa: e.target.value })
                }
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
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-zinc-200/90 dark:border-white/10 bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 shadow-xs transition-colors"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-zinc-200/90 dark:border-white/10 bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 shadow-xs transition-colors"
              />
            </div>
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
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
