"use client";

import * as React from "react";
import { Student, Department, PaginationMeta } from "@/types/student";
import { Header } from "@/components/header";
import { Toolbar } from "@/components/toolbar";
import { StudentTable } from "@/components/student-table";
import { Pagination } from "@/components/pagination";
import { EnrollStudentModal } from "@/components/enroll-student-modal";
import { StudentDetailModal } from "@/components/student-detail-modal";
import { EditStudentModal } from "@/components/edit-student-modal";
import { ArchiveConfirmDialog } from "@/components/archive-confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useSearchParams } from "next/navigation";

function EnrollUrlWatcher({ onOpen }: { onOpen: () => void }) {
  const searchParams = useSearchParams();
  const enroll = searchParams?.get("enroll");

  React.useEffect(() => {
    if (enroll === "true") {
      onOpen();
    }
  }, [enroll, onOpen]);

  return null;
}

export default function StudentManagementPortal() {
  const { toast } = useToast();

  // Data States
  const [students, setStudents] = React.useState<Student[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [pagination, setPagination] = React.useState<PaginationMeta>({
    totalRecords: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  // Filter & Query States
  const [search, setSearch] = React.useState("");
  const [departmentId, setDepartmentId] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [includeArchived, setIncludeArchived] = React.useState(false);
  const [sortBy, setSortBy] = React.useState("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Summary Metrics
  const [metrics, setMetrics] = React.useState({
    total: 0,
    active: 0,
    archived: 0,
  });

  // Modal States
  const [isEnrollModalOpen, setIsEnrollModalOpen] = React.useState(false);
  const [detailStudent, setDetailStudent] = React.useState<Student | null>(null);
  const [editStudent, setEditStudent] = React.useState<Student | null>(null);
  const [archiveStudent, setArchiveStudent] = React.useState<Student | null>(null);

  const handleOpenEnrollModal = React.useCallback(() => {
    setIsEnrollModalOpen(true);
  }, []);

  const handleCloseEnrollModal = React.useCallback(() => {
    setIsEnrollModalOpen(false);
    if (typeof window !== "undefined" && window.location.search.includes("enroll=")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("enroll");
      window.history.replaceState(null, "", url.pathname + (url.search ? url.search : ""));
    }
  }, []);

  // Automatically open enrollment modal if ?enroll=true or backup session flag is present
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    let autoEnroll = params.get("enroll") === "true";
    try {
      if (sessionStorage.getItem("arcfield_auto_enroll") === "true") {
        sessionStorage.removeItem("arcfield_auto_enroll");
        autoEnroll = true;
      }
    } catch {}

    if (autoEnroll) {
      const timer = setTimeout(() => {
        setIsEnrollModalOpen(true);
      }, 20);
      return () => clearTimeout(timer);
    }
  }, []);

  // Fetch Departments on Mount
  React.useEffect(() => {
    async function loadDepartments() {
      try {
        const res = await fetch("/api/v1/departments");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setDepartments(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch departments:", err);
      }
    }
    loadDepartments();
  }, []);

  // Fetch Students Query
  React.useEffect(() => {
    let ignore = false;

    async function loadStudents() {
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (departmentId) params.set("departmentId", departmentId);
        if (status) params.set("status", status);
        if (includeArchived) params.set("includeArchived", "true");
        params.set("sortBy", sortBy);
        params.set("sortOrder", sortOrder);
        params.set("page", String(currentPage));
        params.set("limit", String(pageSize));

        const res = await fetch(`/api/v1/students?${params.toString()}`);
        const json = await res.json();

        if (!ignore && res.ok && json.success) {
          setStudents(json.data);
          if (json.pagination) {
            setPagination(json.pagination);
          }
        }
      } catch (err) {
        console.error("Failed to fetch students:", err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadStudents();

    return () => {
      ignore = true;
    };
  }, [
    search,
    departmentId,
    status,
    includeArchived,
    sortBy,
    sortOrder,
    currentPage,
    pageSize,
    refreshKey,
  ]);

  // Load High-Level Metrics (counts) on mount
  React.useEffect(() => {
    let isSubscribed = true;
    async function loadMetrics() {
      try {
        const [allRes, archivedRes] = await Promise.all([
          fetch("/api/v1/students?includeArchived=true&limit=1"),
          fetch("/api/v1/students?includeArchived=true&status=INACTIVE&limit=1"),
        ]);
        const allJson = await allRes.json();
        const archJson = await archivedRes.json();

        if (isSubscribed && allJson.pagination) {
          setMetrics({
            total: allJson.pagination.totalRecords,
            active: allJson.pagination.totalRecords,
            archived: archJson.pagination?.totalRecords ?? 0,
          });
        }
      } catch {
        // Quiet fail for metrics
      }
    }
    loadMetrics();
    return () => {
      isSubscribed = false;
    };
  }, []);

  const refreshMetrics = React.useCallback(async () => {
    try {
      const [allRes, archivedRes] = await Promise.all([
        fetch("/api/v1/students?includeArchived=true&limit=1"),
        fetch("/api/v1/students?includeArchived=true&status=INACTIVE&limit=1"),
      ]);
      const allJson = await allRes.json();
      const archJson = await archivedRes.json();

      if (allJson.pagination) {
        setMetrics({
          total: allJson.pagination.totalRecords,
          active: allJson.pagination.totalRecords,
          archived: archJson.pagination?.totalRecords ?? 0,
        });
      }
    } catch {
      // Quiet fail for metrics
    }
  }, []);

  // Filter handlers with page reset
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (val: string) => {
    setDepartmentId(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setCurrentPage(1);
  };

  const handleIncludeArchivedChange = (val: boolean) => {
    setIncludeArchived(val);
    setCurrentPage(1);
  };

  const handleSortByChange = (val: string) => {
    setSortBy(val);
    setCurrentPage(1);
  };

  const handleSortOrderChange = (val: "asc" | "desc") => {
    setSortOrder(val);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Modal Handlers
  const handleStudentCreated = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
    setPagination((prev) => ({
      ...prev,
      totalRecords: prev.totalRecords + 1,
    }));
    refreshMetrics();
  };

  const handleStudentUpdated = (updated: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
    if (detailStudent?.id === updated.id) {
      setDetailStudent(updated);
    }
  };

  const handleStudentArchived = (
    targetStudent: Student,
    isHardDeleted: boolean
  ) => {
    if (isHardDeleted) {
      setStudents((prev) => prev.filter((s) => s.id !== targetStudent.id));
      setPagination((prev) => ({
        ...prev,
        totalRecords: Math.max(0, prev.totalRecords - 1),
      }));
    } else {
      if (!includeArchived) {
        setStudents((prev) => prev.filter((s) => s.id !== targetStudent.id));
        setPagination((prev) => ({
          ...prev,
          totalRecords: Math.max(0, prev.totalRecords - 1),
        }));
      } else {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === targetStudent.id ? { ...s, isArchived: true } : s
          )
        );
      }
    }
    refreshMetrics();
  };

  const handleRestoreStudent = async (student: Student) => {
    try {
      const res = await fetch(`/api/v1/students/${student.id}/restore`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        toast({
          type: "error",
          title: "Restore Failed",
          description: data.message || "Failed to restore student record.",
        });
        return;
      }

      toast({
        type: "success",
        title: "Record Restored",
        description: `Student ${student.firstName} ${student.lastName} returned to active cohort.`,
      });

      handleStudentUpdated(data.data);
      refreshMetrics();
    } catch {
      toast({
        type: "error",
        title: "Network Error",
        description: "Failed to connect to registry server.",
      });
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setDepartmentId("");
    setStatus("");
    setIncludeArchived(false);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    departmentId !== "" ||
    status !== "" ||
    includeArchived;

  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportCSV = React.useCallback(async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (departmentId) params.set("departmentId", departmentId);
      if (status) params.set("status", status);
      if (includeArchived) params.set("includeArchived", "true");
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      params.set("page", "1");
      params.set("limit", "1000");

      const res = await fetch(`/api/v1/students?${params.toString()}`);
      const json = await res.json();
      const recordsToExport: Student[] =
        json.success && Array.isArray(json.data) ? json.data : students;

      if (recordsToExport.length === 0) {
        toast({
          type: "info",
          title: "No Records to Export",
          description: "There are no student profiles matching the current filter criteria.",
        });
        return;
      }

      const headers = [
        "Student ID",
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Date of Birth",
        "Department",
        "Academic Year",
        "GPA",
        "Status",
        "Archived",
        "Date Enrolled",
      ];

      const escapeCSV = (val: unknown) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const rows = recordsToExport.map((s) => [
        escapeCSV(s.studentId),
        escapeCSV(s.firstName),
        escapeCSV(s.lastName),
        escapeCSV(s.email),
        escapeCSV(s.phone || "N/A"),
        escapeCSV(s.dateOfBirth || "N/A"),
        escapeCSV(
          s.department?.name ||
            departments.find((d) => d.id === s.departmentId)?.name ||
            s.departmentId
        ),
        escapeCSV(s.academicYear),
        escapeCSV(
          s.gpa !== null && s.gpa !== undefined ? s.gpa.toFixed(2) : "N/A"
        ),
        escapeCSV(s.status),
        escapeCSV(s.isArchived ? "Yes" : "No"),
        escapeCSV(new Date(s.createdAt).toISOString().split("T")[0]),
      ]);

      const csvContent =
        "\uFEFF" +
        [
          headers.map(escapeCSV).join(","),
          ...rows.map((r) => r.join(",")),
        ].join("\r\n");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      link.setAttribute("href", url);
      link.setAttribute("download", `arcfield-student-registry-${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        type: "success",
        title: "Registry Exported",
        description: `Successfully exported ${recordsToExport.length} student records to CSV.`,
      });
    } catch {
      toast({
        type: "error",
        title: "Export Failed",
        description: "An error occurred while compiling the registry export.",
      });
    } finally {
      setIsExporting(false);
    }
  }, [
    search,
    departmentId,
    status,
    includeArchived,
    sortBy,
    sortOrder,
    students,
    departments,
    toast,
  ]);

  return (
    <>
      <React.Suspense fallback={null}>
        <EnrollUrlWatcher onOpen={handleOpenEnrollModal} />
      </React.Suspense>
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
        {/* Institutional Top Navigation Header */}
        <Header
          onOpenEnrollModal={handleOpenEnrollModal}
          totalStudents={pagination.totalRecords}
          activeStudents={pagination.totalRecords}
          archivedStudents={metrics.archived}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          {/* Minimalist Hero Section */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-1 animate-text-reveal">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Student Directory
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-xl leading-relaxed">
                Institutional academic records, departmental divisions, and lifecycle registry.
              </p>
            </div>

            {/* Subtle Inline Census Strip */}
            <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-500 dark:text-zinc-400 shrink-0">
              <div className="px-2.5 py-1 rounded-md glass-card-subtle flex items-center gap-2">
                <span className="text-zinc-400 text-[10px]">TOTAL</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{pagination.totalRecords}</span>
              </div>
              <div className="px-2.5 py-1 rounded-md glass-card-subtle flex items-center gap-2">
                <span className="text-zinc-400 text-[10px]">DIVISIONS</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{departments.length}</span>
              </div>
            </div>
          </div>

          {/* Toolbar & Filter Engine */}
          <section aria-label="Directory Filters">
            <Toolbar
              search={search}
              onSearchChange={handleSearchChange}
              departmentId={departmentId}
              onDepartmentChange={handleDepartmentChange}
              status={status}
              onStatusChange={handleStatusChange}
              includeArchived={includeArchived}
              onIncludeArchivedChange={handleIncludeArchivedChange}
              sortBy={sortBy}
              onSortByChange={handleSortByChange}
              sortOrder={sortOrder}
              onSortOrderChange={handleSortOrderChange}
              departments={departments}
              onRefresh={() => {
                setIsLoading(true);
                setRefreshKey((k) => k + 1);
              }}
              isLoading={isLoading}
              onResetFilters={handleResetFilters}
              onExport={handleExportCSV}
              isExporting={isExporting}
            />
          </section>

          {/* Student Records Data Table */}
          <section aria-label="Student Records Table" className="space-y-3">
            <StudentTable
              students={students}
              isLoading={isLoading}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onViewStudent={(student) => setDetailStudent(student)}
              onEditStudent={(student) => setEditStudent(student)}
              onArchiveStudent={(student) => setArchiveStudent(student)}
              onRestoreStudent={handleRestoreStudent}
              onOpenEnrollModal={handleOpenEnrollModal}
              onResetFilters={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
            />

            {/* Pagination Controls */}
            {students.length > 0 && (
              <Pagination
                pagination={pagination}
                onPageChange={(p) => {
                  setIsLoading(true);
                  setCurrentPage(p);
                }}
                onLimitChange={(l) => {
                  setIsLoading(true);
                  setPageSize(l);
                  setCurrentPage(1);
                }}
              />
            )}
          </section>

          {/* Minimalist Institutional Footer */}
          <footer className="pt-8 pb-4 border-t border-zinc-200/60 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
            <span>ARCFIELD SYSTEMS · ACADEMIC REGISTRY</span>
            <span>SYSTEM ENCRYPTED · PARALLEL PERSISTENCE</span>
          </footer>
        </main>

      {/* Modals & Dialogs (Mounted conditionally for clean lifecycle and zero state loops) */}
      {isEnrollModalOpen && (
        <EnrollStudentModal
          isOpen={true}
          onClose={handleCloseEnrollModal}
          departments={departments}
          onStudentCreated={handleStudentCreated}
        />
      )}

      {detailStudent && (
        <StudentDetailModal
          key={detailStudent.id}
          student={detailStudent}
          isOpen={true}
          onClose={() => setDetailStudent(null)}
          onEdit={(student) => {
            setDetailStudent(null);
            setEditStudent(student);
          }}
          onArchive={(student) => {
            setDetailStudent(null);
            setArchiveStudent(student);
          }}
          onRestore={handleRestoreStudent}
        />
      )}

      {editStudent && (
        <EditStudentModal
          key={editStudent.id}
          student={editStudent}
          isOpen={true}
          onClose={() => setEditStudent(null)}
          departments={departments}
          onStudentUpdated={handleStudentUpdated}
        />
      )}

      {archiveStudent && (
        <ArchiveConfirmDialog
          key={archiveStudent.id}
          student={archiveStudent}
          isOpen={true}
          onClose={() => setArchiveStudent(null)}
          onArchived={handleStudentArchived}
        />
      )}
      </div>
    </>
  );
}
