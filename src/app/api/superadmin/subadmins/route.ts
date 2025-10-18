import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import {
  validateSuperAdmin,
  createAuthErrorResponse,
} from "../../../../libs/auth-utils";

export async function GET(request: NextRequest) {
  // Authorize
  const auth = await validateSuperAdmin(request);
  if (!auth.success) return createAuthErrorResponse(auth);

  try {
    // Extract pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page

    const skip = (validPage - 1) * validLimit;

    // Get total count for pagination metadata
    const totalCount = await prisma.users.count({
      where: {
        role: "ADMIN", // Subadmins have role ADMIN
      },
    });

    // Get subadmins (users with role ADMIN) with their election assignments
    const subadmins = await prisma.users.findMany({
      skip,
      take: validLimit,
      where: {
        role: "ADMIN",
      },
      include: {
        adminAssignments: {
          include: {
            election: {
              select: {
                id: true,
                title: true,
                status: true,
                start_time: true,
                end_time: true,
                department: true,
                is_general: true,
              },
            },
          },
        },
        _count: {
          select: {
            adminAssignments: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Transform data for frontend
    const transformedSubadmins = subadmins.map((admin) => ({
      id: admin.id,
      full_name: admin.full_name,
      email: admin.email,
      role: admin.role,
      status: admin.status || "ACTIVE",
      created_at: admin.created_at.toISOString(),
      updated_at: admin.updated_at.toISOString(),
      electionsCount: admin._count.adminAssignments,
      elections: admin.adminAssignments.map((assignment) => ({
        id: assignment.election.id,
        title: assignment.election.title,
        status: assignment.election.status,
        department: assignment.election.department,
        is_general: assignment.election.is_general,
        start_time: assignment.election.start_time?.toISOString(),
        end_time: assignment.election.end_time?.toISOString(),
        assigned_at: assignment.created_at.toISOString(),
      })),
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / validLimit);
    const hasNextPage = validPage < totalPages;
    const hasPrevPage = validPage > 1;

    // Return subadmins with pagination metadata
    const response = {
      subadmins: transformedSubadmins,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalCount,
        limit: validLimit,
        hasNextPage,
        hasPrevPage,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching subadmins:", error);
    return NextResponse.json(
      { error: "Failed to fetch subadmins" },
      { status: 500 }
    );
  }
}
