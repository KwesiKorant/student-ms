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
import { verifyApiAuth } from "@/lib/auth-check";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
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
        message: "Institutional authentication required to restore student records.",
      },
      { status: 401, rateLimit }
    );
  }

  try {
    const { id } = await params;

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

    if (!existingStudent.isArchived) {
      return jsonResponse(
        {
          success: false,
          error: "BAD_REQUEST",
          message: `Student ${existingStudent.firstName} ${existingStudent.lastName} is already active.`,
        },
        { status: 400, rateLimit }
      );
    }

    // Single Round-Trip Pipelined Atomic Tuple Transaction
    const restoredAt = new Date();
    const [restored] = await prisma.$transaction([
      prisma.student.update({
        where: { id: existingStudent.id },
        data: {
          isArchived: false,
          archivedAt: null,
        },
        include: {
          department: true,
        },
      }),
      prisma.auditLog.create({
        data: {
          studentId: existingStudent.id,
          action: "RESTORE",
          details: JSON.stringify({
            event: "Student record restored from archival",
            studentId: existingStudent.studentId,
            restoredAt: restoredAt.toISOString(),
          }),
          performedBy: auth.userId || "admin_registrar",
        },
      }),
    ]);

    return successResponse(restored, {
      message: `Student ${restored.firstName} ${restored.lastName} restored successfully.`,
      rateLimit,
    });
  } catch (error) {
    return handleApiError(error, rateLimit);
  }
}
