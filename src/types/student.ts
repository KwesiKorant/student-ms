export type EnrollmentStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "GRADUATED";

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  studentCount?: number;
}

export interface AuditLog {
  id: string;
  studentId: string;
  action: "CREATE" | "UPDATE" | "ARCHIVE" | "RESTORE";
  details: string; // JSON string
  performedBy: string;
  timestamp: string;
}

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string | null;
  phone?: string | null;
  departmentId: string;
  department?: Department;
  academicYear: number;
  gpa?: number | null;
  status: EnrollmentStatus;
  isArchived: boolean;
  archivedAt?: string | null;
  auditLogs?: AuditLog[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  totalRecords: number;
  page: number;
  limit: number;
  totalPages: number;
}
