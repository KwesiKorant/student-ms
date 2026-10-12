export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Validates and normalizes internal redirect paths to prevent Open Redirects (CWE-601).
 * Disallows protocol-relative URLs (//example.com), backslash evasions (/\evil.com),
 * and absolute URLs.
 */
export function getSafeRedirectUrl(
  url: string | null | undefined,
  fallback = "/registry"
): string {
  if (!url || typeof url !== "string") return fallback;
  const trimmed = url.trim();
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.startsWith("/\\")
  ) {
    return trimmed;
  }
  return fallback;
}

