import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/owner",
  "/manager",
  "/auditor",
  "/admin",
  "/account",
  "/enquiries",
];

const ROLE_ROUTES: Record<string, string[]> = {
  owner:         ["/owner"],
  hotel_manager: ["/manager"],
  auditor:       ["/auditor"],
  admin:         ["/admin"],
  super_admin:   ["/admin"],
  consumer:      ["/account", "/enquiries"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected  = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Read auth from cookie (set on login)
  const token = request.cookies.get("aahar-token")?.value;
  const role  = request.cookies.get("aahar-role")?.value;

  if (!token) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Check role has access to this route
  const allowedPaths = ROLE_ROUTES[role ?? ""] ?? [];
  const hasAccess    = allowedPaths.some(p => pathname.startsWith(p));
  if (!hasAccess) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/owner/:path*",
    "/manager/:path*",
    "/auditor/:path*",
    "/admin/:path*",
    "/account/:path*",
    "/enquiries/:path*",
  ],
};

