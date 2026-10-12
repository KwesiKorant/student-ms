"use client";

import * as React from "react";
import { Student, Department, PaginationMeta } from "@/types/student";
import { Header } from "@/components/header";
import { Toolbar, ActiveFilterChips } from "@/components/toolbar";
import { ExpandingSearchDock } from "@/components/ui/expanding-search-dock";
import { TextReveal } from "@/components/ui/text-reveal";
import { StudentTable } from "@/components/student-table";
import { Pagination } from "@/components/pagination";
import { EnrollStudentModal } from "@/components/enroll-student-modal";
import { StudentDetailModal } from "@/components/student-detail-modal";
import { EditStudentModal } from "@/components/edit-student-modal";
import { ArchiveConfirmDialog } from "@/components/archive-confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useStudentRealtime } from "@/hooks/use-student-realtime";

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
  const queryClient = useQueryClient();

  // Filter & Query States
  const [search, setSearch] = React.useState("");
  const [departmentId, setDepartmentId] = React.useState("");
  const [academicYear, setAcademicYear] = React.useState<number | "">("");
  const [status, setStatus] = React.useState("");
  const [gpaTier, setGpaTier] = React.useState<string>("");
  const [includeArchived, setIncludeArchived] = React.useState(false);
  const [sortBy, setSortBy] = React.useState("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Modal States
  const [isEnrollModalOpen, setIsEnrollModalOpen] = React.useState(false);
  const [detailStudent, setDetailStudent] = React.useState<Student | null>(null);
  const [editStudent, setEditStudent] = React.useState<Student | null>(null);
  const [archiveStudent, setArchiveStudent] = React.useState<Student | null>(null);

  // Supabase Realtime WebSocket Sync: invalidate cache on any PostgreSQL CDC event
  const handleRealtimeChange = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["students"] });
    queryClient.invalidateQueries({ queryKey: ["census"] });
  }, [queryClient]);

  const { isConnected: isRealtimeConnected } = useStudentRealtime(handleRealtimeChange);

  // TanStack Query: Fetch Departments (cached for 15 minutes)
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await fetch("/api/v1/departments");
      const json = await res.json();
      return json.success && Array.isArray(json.data) ? json.data : [];
    },
    staleTime: 1000 * 60 * 15,
  });

  // TanStack Query: Fetch High-Level Census Metrics
  const { data: metrics = { total: 0, active: 0, archived: 0 } } = useQuery({
    queryKey: ["census"],
    queryFn: async () => {
      const [allRes, archivedRes] = await Promise.all([
        fetch("/api/v1/students?includeArchived=true&limit=1"),
        fetch("/api/v1/students?includeArchived=true&status=INACTIVE&limit=1"),
      ]);
      const allJson = await allRes.json();
      const archJson = await archivedRes.json();
      return {
        total: allJson.pagination?.totalRecords ?? 0,
        active: allJson.pagination?.totalRecords ?? 0,
        archived: archJson.pagination?.totalRecords ?? 0,
      };
    },
    staleTime: 1000 * 60,
  });

  // Query Parameters Bundle
  const queryParams = React.useMemo(
    () => ({
      search: search.trim(),
      departmentId,
      academicYear,
      status,
      gpaTier,
      includeArchived,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: pageSize,
    }),
    [search, departmentId, academicYear, status, gpaTier, includeArchived, sortBy, sortOrder, currentPage, pageSize]
  );

  // TanStack Query: Fetch Students with smooth placeholderData
  const {
    data: studentsResult,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["students", queryParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (queryParams.search) params.set("search", queryParams.search);
      if (queryParams.departmentId) params.set("departmentId", queryParams.departmentId);
      if (queryParams.academicYear) params.set("academicYear", String(queryParams.academicYear));
      if (queryParams.status) params.set("status", queryParams.status);
      if (queryParams.gpaTier) params.set("gpaTier", queryParams.gpaTier);
      if (queryParams.includeArchived) params.set("includeArchived", "true");
      params.set("sortBy", queryParams.sortBy);
      params.set("sortOrder", queryParams.sortOrder);
      params.set("page", String(queryParams.page));
      params.set("limit", String(queryParams.limit));

      const res = await fetch(`/api/v1/students?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error("Failed to load students");
      }
      return {
        students: (json.data ?? []) as Student[],
        pagination: (json.pagination ?? {
          totalRecords: 0,
          page: queryParams.page,
          limit: queryParams.limit,
          totalPages: 1,
        }) as PaginationMeta,
      };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30, // 30s fresh cache
  });

  const students = studentsResult?.students ?? [];
  const pagination = studentsResult?.pagination ?? {
    totalRecords: 0,
    page: currentPage,
    limit: pageSize,
    totalPages: 1,
  };

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

  // Filter handlers with page reset
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (val: string) => {
    setDepartmentId(val);
    setCurrentPage(1);
  };

  const handleAcademicYearChange = (val: number | "") => {
    setAcademicYear(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setCurrentPage(1);
  };

  const handleGpaTierChange = (val: string) => {
    setGpaTier(val);
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

  // Mutation Handlers: update TanStack Query cache
  const handleStudentCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["students"] });
    queryClient.invalidateQueries({ queryKey: ["census"] });
  };

  const handleStudentUpdated = (updated: Student) => {
    queryClient.invalidateQueries({ queryKey: ["students"] });
    queryClient.invalidateQueries({ queryKey: ["census"] });
    if (detailStudent?.id === updated.id) {
      setDetailStudent(updated);
    }
  };

  const handleStudentArchived = (targetStudent: Student) => {
    queryClient.invalidateQueries({ queryKey: ["students"] });
    queryClient.invalidateQueries({ queryKey: ["census"] });
    if (detailStudent?.id === targetStudent.id) {
      setDetailStudent(null);
    }
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

      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["census"] });
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
    setAcademicYear("");
    setStatus("");
    setGpaTier("");
    setIncludeArchived(false);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    departmentId !== "" ||
    academicYear !== "" ||
    status !== "" ||
    gpaTier !== "" ||
    includeArchived;

  // RFC-4180 CSV Export Generator
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportCSV = React.useCallback(async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (departmentId) params.set("departmentId", departmentId);
      if (academicYear) params.set("academicYear", String(academicYear));
      if (status) params.set("status", status);
      if (gpaTier) params.set("gpaTier", gpaTier);
      if (includeArchived) params.set("includeArchived", "true");
      params.set("limit", "1000");

      const res = await fetch(`/api/v1/students?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success || !Array.isArray(json.data)) {
        toast({
          type: "error",
          title: "Export Failed",
          description: "Could not retrieve records for CSV generation.",
        });
        setIsExporting(false);
        return;
      }

      const records: Student[] = json.data;
      if (records.length === 0) {
        toast({
          type: "info",
          title: "No Records",
          description: "No student records match the export criteria.",
        });
        setIsExporting(false);
        return;
      }

      const headers = [
        "Student ID",
        "First Name",
        "Last Name",
        "Institutional Email",
        "Department Code",
        "Department Name",
        "Academic Year",
        "Cumulative GPA",
        "Enrollment Status",
        "Archived",
        "Enrolled Date",
      ];

      const escapeCSV = (value: string | number | null | undefined): string => {
        if (value === null || value === undefined) return '""';
        const str = String(value);
        if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return `"${str}"`;
      };

      const rows = records.map((s) => [
        escapeCSV(s.studentId),
        escapeCSV(s.firstName),
        escapeCSV(s.lastName),
        escapeCSV(s.email),
        escapeCSV(s.department?.code || ""),
        escapeCSV(s.department?.name || ""),
        escapeCSV(s.academicYear),
        escapeCSV(s.gpa != null ? s.gpa.toFixed(2) : "N/A"),
        escapeCSV(s.status),
        escapeCSV(s.isArchived ? "Yes" : "No"),
        escapeCSV(new Date(s.createdAt).toISOString().split("T")[0]),
      ]);

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

      link.setAttribute("href", url);
      link.setAttribute("download", `arcfield_students_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        type: "success",
        title: "Export Completed",
        description: `Exported ${records.length} records.`,
      });
    } catch {
      toast({
        type: "error",
        title: "Export Failed",
        description: "An unexpected error occurred during CSV generation.",
      });
    } finally {
      setIsExporting(false);
    }
  }, [search, departmentId, academicYear, status, gpaTier, includeArchived, toast]);

  return (
    <>
      <React.Suspense fallback={null}>
        <EnrollUrlWatcher onOpen={handleOpenEnrollModal} />
      </React.Suspense>

      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-150">
        {/* Header with Auth User Session & Theme Controls */}
        <Header onOpenEnrollModal={handleOpenEnrollModal} />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          {/* Minimalist Hero Section */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-1">
            <div>
              <TextReveal
                as="h1"
                delay={0.08}
                className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
              >
                Student Directory
              </TextReveal>
              <TextReveal
                as="p"
                delay={0.22}
                className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-xl leading-relaxed"
              >
                Institutional academic records, departmental divisions, and lifecycle registry.
              </TextReveal>
            </div>

            {/* Consolidated Institutional Status Strip */}
            <TextReveal
              delay={0.38}
              className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 shrink-0"
            >
              <div className="px-2.5 py-1 rounded-md glass-card-subtle flex items-center gap-1.5 border border-zinc-200/60 dark:border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-zinc-400 text-[10px]">ACTIVE</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{metrics.active}</span>
              </div>
              <div className="px-2.5 py-1 rounded-md glass-card-subtle flex items-center gap-1.5 border border-zinc-200/60 dark:border-white/5">
                <span className="text-zinc-400 text-[10px]">TOTAL</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{metrics.total}</span>
              </div>
              <div className="px-2.5 py-1 rounded-md glass-card-subtle flex items-center gap-1.5 border border-zinc-200/60 dark:border-white/5">
                <span className="text-zinc-400 text-[10px]">DIVISIONS</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{departments.length}</span>
              </div>
              {metrics.archived > 0 && (
                <div className="px-2.5 py-1 rounded-md glass-card-subtle flex items-center gap-1.5 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-[10px]">ARCHIVED</span>
                  <span className="font-semibold">{metrics.archived}</span>
                </div>
              )}
            </TextReveal>
          </div>

          {/* Controls Strip: Separated Search Dock & Filter Toolbar (Option C) */}
          <TextReveal delay={0.52} as="section" aria-label="Directory Search and Filters" className="relative z-30 space-y-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Capsule 1: Autonomous Expanding Search Icon Button (~40px) */}
              <ExpandingSearchDock
                value={search}
                onChange={handleSearchChange}
                placeholder="Search registry (name, ID, email)..."
              />

              {/* Capsule 2: Filter & Output Controls Strip (min-h-10) */}
              <div className="flex-1 min-w-0">
                <Toolbar
                  departmentId={departmentId}
                  onDepartmentChange={handleDepartmentChange}
                  academicYear={academicYear}
                  onAcademicYearChange={handleAcademicYearChange}
                  status={status}
                  onStatusChange={handleStatusChange}
                  gpaTier={gpaTier}
                  onGpaTierChange={handleGpaTierChange}
                  includeArchived={includeArchived}
                  onIncludeArchivedChange={handleIncludeArchivedChange}
                  sortBy={sortBy}
                  onSortByChange={handleSortByChange}
                  sortOrder={sortOrder}
                  onSortOrderChange={handleSortOrderChange}
                  departments={departments}
                  onRefresh={() => {
                    queryClient.invalidateQueries({ queryKey: ["students"] });
                    queryClient.invalidateQueries({ queryKey: ["census"] });
                  }}
                  isLoading={isLoading || isFetching}
                  onResetFilters={handleResetFilters}
                  onExport={handleExportCSV}
                  isExporting={isExporting}
                  isLiveSync={isRealtimeConnected}
                  showActiveChips={false}
                />
              </div>
            </div>

            {/* Active Filters Micro-Strip (Spans full width under both Search & Toolbar with zero distortion) */}
            <ActiveFilterChips
              search={search}
              onClearSearch={() => handleSearchChange("")}
              departmentId={departmentId}
              onDepartmentChange={handleDepartmentChange}
              academicYear={academicYear}
              onAcademicYearChange={handleAcademicYearChange}
              status={status}
              onStatusChange={handleStatusChange}
              gpaTier={gpaTier}
              onGpaTierChange={handleGpaTierChange}
              includeArchived={includeArchived}
              onIncludeArchivedChange={handleIncludeArchivedChange}
              departments={departments}
              onResetFilters={handleResetFilters}
            />
          </TextReveal>

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
                onPageChange={(p) => setCurrentPage(p)}
                onLimitChange={(l) => {
                  setPageSize(l);
                  setCurrentPage(1);
                }}
              />
            )}
          </section>

          {/* Minimalist Institutional Footer */}
          <footer className="pt-8 pb-4 border-t border-zinc-200/60 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
            <span>ARCFIELD SYSTEMS · ACADEMIC REGISTRY</span>
            <span>SYSTEM ENCRYPTED · PARALLEL PERSISTENCE · REALTIME CDC</span>
          </footer>
        </main>

        {/* Modals & Dialogs */}
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
