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
import {
  ShieldCheck,
  Building2,
  FileCheck2,
} from "lucide-react";

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

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Institutional Top Navigation Header */}
      <Header
        onOpenEnrollModal={() => setIsEnrollModalOpen(true)}
        totalStudents={pagination.totalRecords}
        activeStudents={pagination.totalRecords}
        archivedStudents={metrics.archived}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title & Executive Metrics Strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold border border-zinc-300/50 dark:border-white/10">
                AUSPIFY TASK 2 · ZERO-TRUST ARCHITECTURE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Student Directory & Academic Registry
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Institutional records registry for enrollment governance, academic standing metrics, and lifecycle archival auditing.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xs text-xs font-mono shadow-xs">
              <span className="text-zinc-400 text-[10px] block">TOTAL ENROLLED</span>
              <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {pagination.totalRecords}
              </span>
            </div>
            <div className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xs text-xs font-mono shadow-xs">
              <span className="text-zinc-400 text-[10px] block">DEPARTMENTS</span>
              <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {departments.length}
              </span>
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
            onOpenEnrollModal={() => setIsEnrollModalOpen(true)}
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

        {/* System Capabilities & Compliance Footer Card */}
        <section className="pt-6 border-t border-zinc-200 dark:border-white/10 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-lg border border-zinc-200/80 dark:border-white/5 bg-white/40 dark:bg-zinc-900/40">
              <div className="flex items-center gap-2 font-mono text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Zero-Trust Validation</span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500 leading-relaxed">
                Zod boundary sanitization with strict stripping, parameterized Prisma queries, and in-memory IP sliding-window rate limiting.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-zinc-200/80 dark:border-white/5 bg-white/40 dark:bg-zinc-900/40">
              <div className="flex items-center gap-2 font-mono text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                <FileCheck2 className="w-4 h-4 text-blue-500" />
                <span>Immutable Audit Trail</span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500 leading-relaxed">
                Every creation, modification, archival, and restoration action writes chronological JSON differential records to the database.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-zinc-200/80 dark:border-white/5 bg-white/40 dark:bg-zinc-900/40">
              <div className="flex items-center gap-2 font-mono text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                <Building2 className="w-4 h-4 text-purple-500" />
                <span>Dual-Engine Persistence</span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500 leading-relaxed">
                Seamless local SQLite zero-config evaluation ready for instant migration to enterprise PostgreSQL in production.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Modals & Dialogs (Mounted conditionally for clean lifecycle and zero state loops) */}
      {isEnrollModalOpen && (
        <EnrollStudentModal
          isOpen={true}
          onClose={() => setIsEnrollModalOpen(false)}
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
  );
}
