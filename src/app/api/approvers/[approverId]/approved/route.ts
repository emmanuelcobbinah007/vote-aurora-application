import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";

interface ApprovedElection {
  id: string;
  title: string;
  description?: string;
  department: string;
  isGeneral: boolean;
  startDate: string;
  endDate: string;
  status: "APPROVED" | "LIVE" | "CLOSED" | string;
  approvedBy?: string;
  approvedAt?: string;
  portfolios?: number;
  candidates?: number;
  expectedVoters?: number;
  actualVoters?: number;
  approverComments?: string;
}

// GET /api/approvers/[approverId]/approved
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ approverId: string }> }
) {
  try {
    const { approverId } = await params;
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "all";
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Validate that the approver exists
    const approver = await prisma.users.findUnique({
      where: {
        id: approverId,
        role: "APPROVER",
        status: "ACTIVE",
      },
    });

    if (!approver) {
      return NextResponse.json(
        { error: "Approver not found or inactive" },
        { status: 404 }
      );
    }

    // Build where conditions
    const whereConditions: any = {
      approved_by: approverId,
      status: { in: ["APPROVED", "LIVE", "CLOSED", "ARCHIVED"] },
    };

    // Add search filter
    if (search) {
      whereConditions.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Add department filter
    if (department !== "all") {
      whereConditions.department = department;
    }

    // Add status filter
    if (status !== "all") {
      whereConditions.status = status;
    }

    // Get approved elections with related data
    const [elections, totalCount] = await Promise.all([
      prisma.elections.findMany({
        where: whereConditions,
        include: {
          portfolios: {
            include: {
              _count: {
                select: { candidates: true },
              },
            },
          },
          _count: {
            select: {
              portfolios: true,
              candidates: true,
              voterTokens: true,
              votes: true,
            },
          },
          approver: {
            select: {
              full_name: true,
              email: true,
            },
          },
        },
        orderBy: { updated_at: "desc" },
        skip: offset,
        take: limit,
      }),

      // Get total count for pagination
      prisma.elections.count({
        where: whereConditions,
      }),
    ]);

    // Transform the data to match frontend interface
    const formattedElections: ApprovedElection[] = elections.map(
      (election) => ({
        id: election.id,
        title: election.title,
        description: election.description || "",
        department: election.department || "General",
        isGeneral: election.is_general,
        startDate: election.start_time.toISOString(),
        endDate: election.end_time.toISOString(),
        status: election.status,
        approvedBy: (election as any).approver?.full_name || "Unknown",
        approvedAt: election.updated_at.toISOString(),
        portfolios: (election as any)._count?.portfolios || 0,
        candidates: (election as any)._count?.candidates || 0,
        expectedVoters: (election as any)._count?.voterTokens || 0,
        actualVoters: (election as any)._count?.votes || 0, // This would be unique voters if you track it
        approverComments: "", // Add this field to your schema if needed
      })
    );

    // Get available departments and statuses for filtering
    const [departments, statuses] = await Promise.all([
      prisma.elections.findMany({
        where: { approved_by: approverId },
        select: { department: true },
        distinct: ["department"],
      }),
      prisma.elections.findMany({
        where: { approved_by: approverId },
        select: { status: true },
        distinct: ["status"],
      }),
    ]);

    const availableDepartments = departments
      .map((d) => d.department)
      .filter((d) => d !== null)
      .sort();

    const availableStatuses = statuses
      .map((s) => s.status)
      .filter((s) => s !== "PENDING_APPROVAL")
      .sort();

    return NextResponse.json({
      success: true,
      data: {
        elections: formattedElections,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        filters: {
          departments: ["all", ...availableDepartments],
          statuses: ["all", ...availableStatuses],
        },
      },
    });
  } catch (error) {
    console.error("Error fetching approved elections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
