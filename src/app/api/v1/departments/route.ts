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
} from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const rateLimit: RateLimitResult = checkRateLimit(req, "read");
  if (!rateLimit.allowed) {
    return rateLimitErrorResponse(rateLimit);
  }

  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            students: {
              where: { isArchived: false },
            },
          },
        },
      },
    });

    const formatted = departments.map((d) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      description: d.description,
      studentCount: d._count.students,
    }));

    return successResponse(formatted, { rateLimit });
  } catch (error) {
    return handleApiError(error, rateLimit);
  }
}
