import { z } from "zod";

const nameRegex = /^[a-zA-Z\s'-]+$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const emailDomainRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Semantic date boundaries for student date of birth (14 to 100 years old)
export const MAX_STUDENT_DOB = new Date(Date.now() - 14 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
export const MIN_STUDENT_DOB = new Date(Date.now() - 100 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

const validateDateOfBirth = (val: string | undefined | null) => {
  if (!val || val === "") return true;
  if (!dateRegex.test(val)) return false;
  const d = new Date(val);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  const ageInYears = (now.getTime() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return d < now && ageInYears >= 14 && ageInYears <= 100;
};

const validatePhone = (val: string | undefined | null) => {
  if (!val || val.trim() === "") return true;
  const digits = val.replace(/\D/g, "");
  return (
    digits.length >= 7 &&
    digits.length <= 15 &&
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(val)
  );
};

export const EnrollmentStatusEnum = z.enum([
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "GRADUATED",
]);

export const CreateStudentSchema = z
  .object({
    studentId: z
      .string()
      .trim()
      .transform((val) => val.toUpperCase())
      .refine(
        (val) => /^STU-\d{4}-[A-F0-9]{4}$/.test(val),
        "Student ID must follow format STU-YYYY-XXXX (hex)"
      )
      .optional(),
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must not exceed 50 characters")
      .regex(nameRegex, "First name can only contain letters, spaces, hyphens, and apostrophes"),
    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must not exceed 50 characters")
      .regex(nameRegex, "Last name can only contain letters, spaces, hyphens, and apostrophes"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid institutional email address format")
      .max(100, "Email must not exceed 100 characters")
      .refine(
        (val) => emailDomainRegex.test(val),
        "Institutional email must include a valid domain suffix (e.g. .edu, .com)"
      ),
    dateOfBirth: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        validateDateOfBirth,
        "Date of birth must be a valid date for an enrolled student (between 14 and 100 years of age)"
      ),
    phone: z
      .string()
      .trim()
      .max(25, "Phone number must not exceed 25 characters")
      .optional()
      .or(z.literal(""))
      .refine(
        validatePhone,
        "Please provide a valid phone number with 7-15 digits (e.g. +1-555-0142 or +233-24-123-4567)"
      ),
    departmentId: z.string().min(1, "Department selection is required"),
    academicYear: z.coerce
      .number()
      .int("Academic year must be an integer")
      .min(1, "Academic year must be between 1 and 6")
      .max(6, "Academic year must be between 1 and 6")
      .default(1),
    gpa: z
      .union([
        z.coerce
          .number()
          .min(0.0, "GPA cannot be less than 0.00")
          .max(4.0, "GPA cannot exceed 4.00"),
        z.literal(""),
        z.null(),
      ])
      .optional()
      .transform((val) =>
        val === "" || val === null || val === undefined ? null : Number(val)
      ),
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
      .regex(nameRegex, "First name can only contain letters, spaces, hyphens, and apostrophes")
      .optional(),
    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must not exceed 50 characters")
      .regex(nameRegex, "Last name can only contain letters, spaces, hyphens, and apostrophes")
      .optional(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid institutional email address format")
      .max(100, "Email must not exceed 100 characters")
      .refine(
        (val) => emailDomainRegex.test(val),
        "Institutional email must include a valid domain suffix (e.g. .edu, .com)"
      )
      .optional(),
    dateOfBirth: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        validateDateOfBirth,
        "Date of birth must be a valid date for an enrolled student (between 14 and 100 years of age)"
      ),
    phone: z
      .string()
      .trim()
      .max(25, "Phone number must not exceed 25 characters")
      .optional()
      .or(z.literal(""))
      .refine(
        validatePhone,
        "Please provide a valid phone number with 7-15 digits (e.g. +1-555-0142 or +233-24-123-4567)"
      ),
    departmentId: z.string().min(1, "Department selection is required").optional(),
    academicYear: z.coerce
      .number()
      .int("Academic year must be an integer")
      .min(1, "Academic year must be between 1 and 6")
      .max(6, "Academic year must be between 1 and 6")
      .optional(),
    gpa: z
      .union([
        z.coerce
          .number()
          .min(0.0, "GPA cannot be less than 0.00")
          .max(4.0, "GPA cannot exceed 4.00"),
        z.literal(""),
        z.null(),
      ])
      .optional()
      .transform((val) =>
        val === "" || val === null || val === undefined ? null : Number(val)
      ),
    status: EnrollmentStatusEnum.optional(),
  })
  .strip();

export const StudentQuerySchema = z
  .object({
    search: z.string().trim().optional(),
    departmentId: z.string().trim().optional(),
    status: EnrollmentStatusEnum.optional(),
    academicYear: z.coerce.number().int().min(1).max(6).optional(),
    gpaTier: z.enum(["deans_list", "good_standing", "probation"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    includeArchived: z
      .enum(["true", "false"])
      .optional()
      .transform((val) => val === "true"),
    sortBy: z.enum(["name", "studentId", "gpa", "createdAt", "academicYear", "department"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  })
  .strip();

export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;
export type UpdateStudentInput = z.infer<typeof UpdateStudentSchema>;
export type StudentQueryParams = z.infer<typeof StudentQuerySchema>;
