import { NextRequest } from "next/server";
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
import { UpdateStudentSchema } from "@/lib/validations/student";
import { verifyApiAuth } from "@/lib/auth-check";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const rateLimit: RateLimitResult = checkRateLimit(req, "read");
  if (!rateLimit.allowed) {
    return rateLimitErrorResponse(rateLimit);
  }

  try {
    const { id } = await params;

    const student = await prisma.student.findFirst({
      where: {
        OR: [{ id }, { studentId: id }],
      },
      include: {
        department: true,
        auditLogs: {
          orderBy: { timestamp: "desc" },
          take: 20,
        },
      },
    });

    if (!student) {
      return jsonResponse(
        {
          success: false,
          error: "NOT_FOUND",
          message: `Student with identifier "${id}" could not be found.`,
        },
        { status: 404, rateLimit }
      );
    }

    return successResponse(student, { rateLimit });
  } catch (error) {
    return handleApiError(error, rateLimit);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
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
        message: "Institutional authentication required to update student records.",
      },
      { status: 401, rateLimit }
    );
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const validatedData = UpdateStudentSchema.parse(body);

    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [{ id }, { studentId: id }],
      },
    });

    if (!existingStudent) {
      return jsonResponse(
        {
          success: false,
          error: "NOT_FOUND",
          message: `Student with identifier "${id}" could not be found.`,
        },
        { status: 404, rateLimit }
      );
    }

    // Compute diff between existing and new values
    const diff: Record<string, { from: unknown; to: unknown }> = {};
    const updateData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(validatedData)) {
      if (value !== undefined) {
        const currentVal = existingStudent[key as keyof typeof existingStudent];
        if (currentVal !== value) {
          diff[key] = { from: currentVal, to: value };
          updateData[key] = value;
        }
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const student = await tx.student.update({
        where: { id: existingStudent.id },
        data: updateData,
        include: {
          department: true,
        },
      });

      if (Object.keys(diff).length > 0) {
        await tx.auditLog.create({
          data: {
            studentId: student.id,
            action: "UPDATE",
            details: JSON.stringify({
              event: "Student profile updated",
              modifiedFields: diff,
            }),
            performedBy: auth.userId || "admin_registrar",
          },
        });
      }

      return student;
    });

    return successResponse(updated, {
      message: "Student record updated successfully.",
      rateLimit,
    });
  } catch (error) {
    return handleApiError(error, rateLimit);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
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
        message: "Institutional authentication required to archive or delete student records.",
      },
      { status: 401, rateLimit }
    );
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const isHardDelete = searchParams.get("hard") === "true";

    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [{ id }, { studentId: id }],
      },
    });

    if (!existingStudent) {
      return jsonResponse(
        {
          success: false,
          error: "NOT_FOUND",
          message: `Student with identifier "${id}" could not be found.`,
        },
        { status: 404, rateLimit }
      );
    }

    if (isHardDelete) {
      // Hard physical deletion (temporarily bypass immutability trigger for audit log cascade)
      await prisma.$executeRawUnsafe(
        'ALTER TABLE public."AuditLog" DISABLE TRIGGER trg_prevent_audit_log_modification;'
      );
      try {
        await prisma.student.delete({
          where: { id: existingStudent.id },
        });
      } finally {
        await prisma.$executeRawUnsafe(
          'ALTER TABLE public."AuditLog" ENABLE TRIGGER trg_prevent_audit_log_modification;'
        );
      }

      return successResponse(
        { id: existingStudent.id, deleted: true },
        {
          message: `Student ${existingStudent.firstName} ${existingStudent.lastName} permanently deleted.`,
          rateLimit,
        }
      );
    }

    // Default: Soft Archival (Single Round-Trip Pipelined Atomic Tuple Transaction)
    const archivedAt = new Date();
    const [archived] = await prisma.$transaction([
      prisma.student.update({
        where: { id: existingStudent.id },
        data: {
          isArchived: true,
          archivedAt,
        },
        include: {
          department: true,
        },
      }),
      prisma.auditLog.create({
        data: {
          studentId: existingStudent.id,
          action: "ARCHIVE",
          details: JSON.stringify({
            event: "Student record soft-archived",
            studentId: existingStudent.studentId,
            fullName: `${existingStudent.firstName} ${existingStudent.lastName}`,
            archivedAt: archivedAt.toISOString(),
          }),
          performedBy: auth.userId || "admin_registrar",
        },
      }),
    ]);

    return successResponse(archived, {
      message: `Student ${archived.firstName} ${archived.lastName} archived safely.`,
      rateLimit,
    });
  } catch (error) {
    return handleApiError(error, rateLimit);
  }
}
