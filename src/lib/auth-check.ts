import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface ApiAuthResult {
  authorized: boolean;
  userId?: string;
  role?: string;
  error?: string;
}

/**
 * Validates request authentication for API Route Handlers.
 * In non-production environments, permits automated integration testing via x-test-bypass.
 * In all other scenarios, cryptographically verifies the active Supabase JWT session (cookie or Bearer).
 */
export async function verifyApiAuth(req: NextRequest): Promise<ApiAuthResult> {
  // Test bypass restricted strictly to non-production integration test suites (CWE-290/CWE-306)
  if (
    process.env.NODE_ENV !== "production" &&
    req.headers.get("x-test-bypass") === "true"
  ) {
    return {
      authorized: true,
      userId: "test_suite_runner",
      role: "REGISTRAR",
    };
  }

  try {
    const supabase = await createClient();
    const authHeader = req.headers.get("authorization");

    let user = null;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        user = data.user;
      }
    }

    if (!user) {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        user = data.user;
      }
    }

    if (!user) {
      return {
        authorized: false,
        error: "UNAUTHORIZED",
      };
    }

    const role =
      (user.app_metadata?.role as string) ||
      (user.user_metadata?.role as string) ||
      "STAFF";

    return {
      authorized: true,
      userId: user.email || user.id,
      role,
    };
  } catch {
    return {
      authorized: false,
      error: "AUTH_VERIFICATION_FAILED",
    };
  }
}
