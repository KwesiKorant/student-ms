import { z } from "zod";

const nameRegex = /^[a-zA-Z\s'-]+$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const EnrollmentStatusEnum = z.enum([
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "GRADUATED",
]);

export const CreateStudentSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must not exceed 50 characters")
      .regex(nameRegex, "First name can only contain letters, spaces, and hyphens"),
    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must not exceed 50 characters")
      .regex(nameRegex, "Last name can only contain letters, spaces, and hyphens"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid institutional email address format"),
    dateOfBirth: z
      .string()
      .regex(dateRegex, "Date of birth must be in YYYY-MM-DD format")
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .trim()
      .max(20, "Phone number must not exceed 20 characters")
      .optional()
      .or(z.literal("")),
    departmentId: z.string().min(1, "Department selection is required"),
    academicYear: z.coerce
      .number()
      .int("Academic year must be an integer")
      .min(1, "Academic year must be between 1 and 6")
      .max(6, "Academic year must be between 1 and 6")
      .default(1),
    gpa: z
      .union([
        z.coerce.number().min(0.0, "GPA cannot be less than 0.00").max(4.0, "GPA cannot exceed 4.00"),
        z.literal(""),
        z.null(),
      ])
      .optional()
      .transform((val) => (val === "" || val === null || val === undefined ? null : Number(val))),
    status: EnrollmentStatusEnum.default("ACTIVE"),
  })
  .strip();

export const UpdateStudentSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must not exceed 50 characters")
      .regex(nameRegex, "First name can only contain letters, spaces, and hyphens")
      .optional(),
    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must not exceed 50 characters")
      .regex(nameRegex, "Last name can only contain letters, spaces, and hyphens")
      .optional(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid institutional email address format")
      .optional(),
    dateOfBirth: z
      .string()
      .regex(dateRegex, "Date of birth must be in YYYY-MM-DD format")
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .trim()
      .max(20, "Phone number must not exceed 20 characters")
      .optional()
      .or(z.literal("")),
    departmentId: z.string().min(1, "Department selection is required").optional(),
    academicYear: z.coerce
      .number()
      .int("Academic year must be an integer")
      .min(1, "Academic year must be between 1 and 6")
      .max(6, "Academic year must be between 1 and 6")
      .optional(),
    gpa: z
      .union([
        z.coerce.number().min(0.0, "GPA cannot be less than 0.00").max(4.0, "GPA cannot exceed 4.00"),
        z.literal(""),
        z.null(),
      ])
      .optional()
      .transform((val) => (val === "" || val === null || val === undefined ? null : Number(val))),
    status: EnrollmentStatusEnum.optional(),
  })
  .strip();

export const StudentQuerySchema = z
  .object({
    search: z.string().trim().optional(),
    departmentId: z.string().trim().optional(),
    status: EnrollmentStatusEnum.optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    includeArchived: z
      .enum(["true", "false"])
      .optional()
      .transform((val) => val === "true"),
    sortBy: z.enum(["name", "studentId", "gpa", "createdAt", "academicYear"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  })
  .strip();

export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;
export type UpdateStudentInput = z.infer<typeof UpdateStudentSchema>;
export type StudentQueryParams = z.infer<typeof StudentQuerySchema>;
