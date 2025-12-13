import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { authOptions } from "@/libs/auth";

export type Role =
  | "VOTER"
  | "ADMIN"
  | "SUPERADMIN"
  | "APPROVER"
  | "ORCHESTRATOR";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  full_name: string;
  status: string;
}

/**
 * Validates that a user is authenticated and returns the user object from the DB.
 * This ensures that the user's role is fresh and not just from a stale JWT.
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return null;
  }

  try {
    const user = await prisma.users.findUnique({
      where: {
        email: session.user.email,
        deleted_at: null, // Exclude soft-deleted users
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        full_name: true,
      },
    });

    if (!user || user.status !== "ACTIVE") {
      return null;
    }

    return user as AuthUser;
  } catch (error) {
    console.error("Auth validation error:", error);
    return null;
  }
}

/**
 * Validates that a user is authenticated and has one of the allowed roles.
 * Returns the user object if authorized, or returns a NextResponse error if not.
 *
 * Usage:
 * const authResult = await requireRole(["ADMIN", "SUPERADMIN"]);
 * if (authResult instanceof NextResponse) return authResult;
 * const user = authResult;
 */
export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Please log in" },
      { status: 401 }
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { success: false, error: "Forbidden: Insufficient permissions" },
      { status: 403 }
    );
  }

  return user;
}
