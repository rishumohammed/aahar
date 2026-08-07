import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes an image URL for display in browser.
 * Strips internal docker hostnames (e.g. http://backend:3001) or localhost URLs
 * so relative /uploads/... paths can be served through Next.js proxy rewrite.
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  if (
    trimmed.startsWith("http://backend:") ||
    trimmed.startsWith("http://localhost:") ||
    trimmed.startsWith("http://127.0.0.1:") ||
    trimmed.startsWith("https://backend:") ||
    trimmed.startsWith("https://localhost:")
  ) {
    if (trimmed.includes("/uploads/")) {
      return trimmed.slice(trimmed.indexOf("/uploads/"));
    }
  }

  return trimmed;
}
