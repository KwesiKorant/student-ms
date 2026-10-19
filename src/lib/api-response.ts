import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { RateLimitResult } from "./rate-limiter";

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
  "Pragma": "no-cache",
};

export interface ApiResponseOptions {
  status?: number;
  rateLimit?: RateLimitResult;
  headers?: Record<string, string>;
}

export function jsonResponse<T>(
  body: T,
  options: ApiResponseOptions = {}
): NextResponse {
  const { status = 200, rateLimit, headers = {} } = options;

  const responseHeaders = new Headers();

  // Apply mandatory security headers
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    responseHeaders.set(key, value);
  }

  // Apply custom headers
  for (const [key, value] of Object.entries(headers)) {
    responseHeaders.set(key, value);
  }

  // Apply rate limit headers
  if (rateLimit) {
    responseHeaders.set("X-RateLimit-Limit", rateLimit.limit.toString());
    responseHeaders.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
    if (rateLimit.retryAfterSeconds) {
      responseHeaders.set("Retry-After", rateLimit.retryAfterSeconds.toString());
    }
  }

  return NextResponse.json(body, {
    status,
    headers: responseHeaders,
  });
}

export function successResponse<T>(
  data: T,
  meta?: {
    message?: string;
    pagination?: {
      totalRecords: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    status?: number;
    rateLimit?: RateLimitResult;
  }
) {
  const body: Record<string, unknown> = {
    success: true,
    data,
  };

  if (meta?.message) {
    body.message = meta.message;
  }

  if (meta?.pagination) {
    body.pagination = meta.pagination;
  }

  return jsonResponse(body, {
    status: meta?.status ?? 200,
    rateLimit: meta?.rateLimit,
  });
}

export function rateLimitErrorResponse(rateLimit: RateLimitResult) {
  return jsonResponse(
    {
      success: false,
      error: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded. Please wait ${rateLimit.retryAfterSeconds || 60} seconds before retrying.`,
    },
    {
      status: 429,
      rateLimit,
      headers: {
        "Retry-After": (rateLimit.retryAfterSeconds || 60).toString(),
      },
    }
  );
}

export function handleApiError(error: unknown, rateLimit?: RateLimitResult) {
  // 1. Zod Validation Errors
  if (error instanceof ZodError) {
    return jsonResponse(
      {
        success: false,
        error: "VALIDATION_ERROR",
        message: "Invalid request payload attributes.",
        details: error.flatten().fieldErrors,
      },
      { status: 400, rateLimit }
    );
  }

  // 1b. JSON Syntax Errors (malformed payload body)
  if (error instanceof SyntaxError) {
    return jsonResponse(
      {
        success: false,
        error: "MALFORMED_JSON",
        message: "Malformed JSON request body.",
      },
      { status: 400, rateLimit }
    );
  }

  // 2. Prisma Database Errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[]) || [];
      const fieldMsg = target.includes("email")
        ? "A student with this email address is already enrolled."
        : target.includes("studentId")
        ? "A student with this ID already exists."
        : "A unique constraint violation occurred.";

      return jsonResponse(
        {
          success: false,
          error: "CONFLICT",
          message: fieldMsg,
        },
        { status: 409, rateLimit }
      );
    }

    if (error.code === "P2025") {
      return jsonResponse(
        {
          success: false,
          error: "NOT_FOUND",
          message: "The requested record could not be found.",
        },
        { status: 404, rateLimit }
      );
    }

    if (error.code === "P2003") {
      return jsonResponse(
        {
          success: false,
          error: "INVALID_RELATION",
          message: "Invalid relational reference (e.g. department does not exist).",
        },
        { status: 400, rateLimit }
      );
    }
  }

  // 3. Fallback Masked Internal Errors (never leak internal stack trace)
  console.error("[Internal API Error Log]:", error);
  return jsonResponse(
    {
      success: false,
      error: "INTERNAL_ERROR",
      message: "An internal server error occurred. Please try again later.",
    },
    { status: 500, rateLimit }
  );
}
