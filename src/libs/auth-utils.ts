import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import bcrypt from "bcrypt";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  fullName: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
  statusCode?: number;
}

/**
 * Validates that a token has all required fields
 */
function isValidToken(token: any): boolean {
  return Boolean(token && token.sub && token.email && token.role);
}

/**
 * Hashes a password using bcrypt
 * @param password - The plain text password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verifies if a password matches a hash
 * @param password - The plain text password to verify
 * @param hashedPassword - The hashed password to compare against
 * @returns True if the password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Validates the current session and returns user data
 * Uses getToken for API routes which is more reliable than getServerSession
 */
export async function validateSession(
  request: NextRequest
): Promise<AuthResult> {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Extract token validation into a separate predicate function
    if (!isValidToken(token)) {
      return {
        success: false,
        error: "Authentication required",
        statusCode: 401,
      };
    }

    // Token is validated above, so we can safely assert its type
    const validToken = token as NonNullable<typeof token>;

    return {
      success: true,
      user: {
        id: validToken.sub!,
        email: validToken.email!,
        role: validToken.role!,
        fullName: validToken.name || validToken.email!,
      },
    };
  } catch (error) {
    console.error("Session validation error:", error);
    return {
      success: false,
      error: "Failed to validate session",
      statusCode: 500,
    };
  }
}

/**
 * Validates session and checks if user has required role(s)
 */
export async function validateUserRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<AuthResult> {
  const authResult = await validateSession(request);

  if (!authResult.success) {
    return authResult;
  }

  if (!allowedRoles.includes(authResult.user!.role)) {
    return {
      success: false,
      error: "Insufficient permissions",
      statusCode: 403,
    };
  }

  return authResult;
}

/**
 * Middleware to check if user is a SUPERADMIN
 */
export async function validateSuperAdmin(
  request: NextRequest
): Promise<AuthResult> {
  return validateUserRole(request, ["SUPERADMIN"]);
}

/**
 * Middleware to check if user is an ORCHESTRATOR or SUPERADMIN
 */
export async function validateOrchestratorOrAdmin(
  request: NextRequest
): Promise<AuthResult> {
  return validateUserRole(request, ["ORCHESTRATOR", "SUPERADMIN"]);
}

/**
 * Checks if an admin is authorized to access a specific election
 * @param adminId - The admin's user ID
 * @param electionId - The election ID to check access for
 * @returns True if the admin has access, false otherwise
 */
export async function isAdminAuthorized(
  adminId: string,
  electionId: string
): Promise<boolean> {
  try {
    const { prisma } = await import("@/libs/prisma");
    
    // Check if there's an admin assignment for this admin and election
    const assignment = await prisma.adminAssignments.findFirst({
      where: {
        admin_id: adminId,
        election_id: electionId,
      },
    });
    
    return !!assignment;
  } catch (error) {
    console.error("Error checking admin authorization:", error);
    return false;
  }
}

/**
 * Utility to create consistent error responses
 */
export function createAuthErrorResponse(authResult: AuthResult) {
  return new Response(JSON.stringify({ error: authResult.error }), {
    status: authResult.statusCode || 500,
    headers: { "Content-Type": "application/json" },
  });
}
