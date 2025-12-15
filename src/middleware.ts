import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't need auth
  const publicPaths = [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/vote", // Voter pages use token-based auth, not session
    "/invite/accept",
    "/api/invite/verify", // Allow token verification
    "/api/invite/accept", // Allow invitation acceptance
    "/election-closed",
    "/api/auth", // Next Auth routes
    "/api/webhooks", // Webhook endpoints (Brevo, etc.)
    "/api/cron", // Cron job endpoints
  ];

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Allow public paths and static assets
  if (isPublicPath || pathname === "/") {
    return NextResponse.next();
  }

  // Get session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // No token = redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based path protection
  const role = token.role as string;

  // Superadmin routes
  if (pathname.startsWith("/superadmin") && role !== "SUPERADMIN") {
    return new NextResponse(
      JSON.stringify({
        error: "Forbidden",
        message: "You don't have permission to access this resource",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Admin routes
  if (
    pathname.startsWith("/admin") &&
    !["ADMIN", "SUPERADMIN"].includes(role)
  ) {
    return new NextResponse(
      JSON.stringify({
        error: "Forbidden",
        message: "You don't have permission to access this resource",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Approver routes
  if (
    pathname.startsWith("/approver") &&
    !["APPROVER", "SUPERADMIN"].includes(role)
  ) {
    return new NextResponse(
      JSON.stringify({
        error: "Forbidden",
        message: "You don't have permission to access this resource",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Orchestrator routes
  if (
    pathname.startsWith("/orchestrator") &&
    !["ORCHESTRATOR", "SUPERADMIN"].includes(role)
  ) {
    return new NextResponse(
      JSON.stringify({
        error: "Forbidden",
        message: "You don't have permission to access this resource",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return NextResponse.next();
}

// Specify which routes middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
