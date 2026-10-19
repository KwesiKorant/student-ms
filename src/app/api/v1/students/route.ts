import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  RateLimitResult,
} from "@/lib/rate-limiter";
import {
  successResponse,
  rateLimitErrorResponse,
  handleApiError,
  jsonResponse,
} from "@/lib/api-response";
import {
  CreateStudentSchema,
  StudentQuerySchema,
} from "@/lib/validations/student";
import { Prisma } from "@prisma/client";
import { verifyApiAuth } from "@/lib/auth-check";

function generateStudentId(): string {
  const year = new Date().getFullYear();
  const hex = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `STU-${year}-${hex}`;
}

export async function GET(req: NextRequest) {
  const rateLimit: RateLimitResult = checkRateLimit(req, "read");
  if (!rateLimit.allowed) {
    return rateLimitErrorResponse(rateLimit);
  }

  try {
    const { searchParams } = new URL(req.url);
    const queryObj: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      queryObj[key] = val;
    });

    const parsedQuery = StudentQuerySchema.parse(queryObj);
    const {
      search,
      departmentId,
      status,
      academicYear,
      gpaTier,
      page,
      limit,
      includeArchived,
      sortBy,
      sortOrder,
    } = parsedQuery;

    const where: Prisma.StudentWhereInput = {};

    // Archival filtering
    if (!includeArchived) {
      where.isArchived = false;
    }

    // Department filtering
    if (departmentId) {
      where.departmentId = departmentId;
    }

    // Status filtering
    if (status) {
      where.status = status;
    }

    // Academic Year filtering
    if (academicYear) {
      where.academicYear = academicYear;
    }

    // GPA Tier filtering
    if (gpaTier) {
      if (gpaTier === "deans_list") {
        where.gpa = { gte: 3.5 };
      } else if (gpaTier === "good_standing") {
        where.gpa = { gte: 2.5, lt: 3.5 };
      } else if (gpaTier === "probation") {
        where.gpa = { lt: 2.0 };
      }
    }

    // Search query matching firstName, lastName, email, studentId
    if (search && search.trim() !== "") {
      const term = search.trim();
      const words = term.split(/\s+/).filter(Boolean).slice(0, 5);
      if (words.length > 1) {
        where.AND = words.map((w) => ({
          OR: [
            { firstName: { contains: w, mode: "insensitive" } },
            { lastName: { contains: w, mode: "insensitive" } },
            { email: { contains: w, mode: "insensitive" } },
            { studentId: { contains: w, mode: "insensitive" } },
          ],
        }));
      } else {
        where.OR = [
          { firstName: { contains: term, mode: "insensitive" } },
          { lastName: { contains: term, mode: "insensitive" } },
          { email: { contains: term, mode: "insensitive" } },
          { studentId: { contains: term, mode: "insensitive" } },
        ];
      }
    }

    // Sorting
    let orderBy: Prisma.StudentOrderByWithRelationInput | Prisma.StudentOrderByWithRelationInput[] = {
      createdAt: sortOrder,
    };

    if (sortBy === "name") {
      orderBy = [{ lastName: sortOrder }, { firstName: sortOrder }];
    } else if (sortBy === "studentId") {
      orderBy = { studentId: sortOrder };
    } else if (sortBy === "gpa") {
      orderBy = { gpa: sortOrder };
    } else if (sortBy === "academicYear") {
      orderBy = { academicYear: sortOrder };
    } else if (sortBy === "department") {
      orderBy = { department: { name: sortOrder } };
    } else if (sortBy === "createdAt") {
      orderBy = { createdAt: sortOrder };
    }

    const skip = (page - 1) * limit;

    const [totalRecords, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return successResponse(students, {
      pagination: {
        totalRecords,
        page,
        limit,
        totalPages,
      },
      rateLimit,
    });
  } catch (error) {
    return handleApiError(error, rateLimit);
  }
}

export async function POST(req: NextRequest) {
  const rateLimit: RateLimitResult = checkRateLimit(req, "mutation");
  if (!rateLimit.allowed) {
    return rateLimitErrorResponse(rateLimit);
  }

  const auth = await verifyApiAuth(req);
  if (!auth.authorized) {
    return jsonResponse(
      {
        success: false,
        error: "UNAUTHORIZED",
        message: "Institutional authentication required to enroll students.",
      },
      { status: 401, rateLimit }
    );
  }

  try {
    const body = await req.json();
    const validatedData = CreateStudentSchema.parse(body);

    let studentId = validatedData.studentId?.toUpperCase();
    if (!studentId) {
      studentId = generateStudentId();
      // Ensure uniqueness
      let exists = await prisma.student.findUnique({ where: { studentId } });
      while (exists) {
        studentId = generateStudentId();
        exists = await prisma.student.findUnique({ where: { studentId } });
      }
    } else {
      const existingId = await prisma.student.findUnique({ where: { studentId } });
      if (existingId) {
        return jsonResponse(
          {
            success: false,
            error: "CONFLICT",
            message: `A student with ID "${studentId}" already exists.`,
          },
          { status: 409, rateLimit }
        );
      }
    }

    const newStudent = await prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          studentId,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          dateOfBirth: validatedData.dateOfBirth || null,
          phone: validatedData.phone || null,
          departmentId: validatedData.departmentId,
          academicYear: validatedData.academicYear,
          gpa: validatedData.gpa,
          status: validatedData.status,
          isArchived: false,
        },
        include: {
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          studentId: student.id,
          action: "CREATE",
          details: JSON.stringify({
            event: "Student enrolled via portal",
            studentId: student.studentId,
            fullName: `${student.firstName} ${student.lastName}`,
            departmentId: student.departmentId,
            academicYear: student.academicYear,
            status: student.status,
            gpa: student.gpa,
          }),
          performedBy: auth.userId || "admin_registrar",
        },
      });

      return student;
    });

    return successResponse(newStudent, {
      message: `Student ${newStudent.firstName} ${newStudent.lastName} enrolled successfully.`,
      status: 201,
      rateLimit,
    });
  } catch (error) {
    return handleApiError(error, rateLimit);
  }
}
