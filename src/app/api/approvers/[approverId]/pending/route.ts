import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";

interface Portfolio {
  id: string;
  title: string;
  description?: string;
  election_id: string;
}

interface Candidate {
  id: string;
  full_name: string;
  photo_url?: string;
  manifesto?: string;
  portfolio_id: string;
  election_id: string;
}

interface Election {
  id: string;
  title: string;
  description: string;
  department: string;
  isGeneral: boolean;
  startDate: string;
  endDate: string;
  status: string;
  createdBy: string;
  createdAt: string;
  portfolios: Portfolio[];
  candidates: Candidate[];
  expectedVoters: number;
}

// GET /api/approvers/[approverId]/pending
export async function GET(
  request: NextRequest,
  { params }: { params: { approverId: string } }
) {
  try {
    const { approverId } = params;
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "all";
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
      status: "PENDING_APPROVAL",
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

    // Get pending elections with related data
    const [elections, totalCount] = await Promise.all([
      prisma.elections.findMany({
        where: whereConditions,
        include: {
          portfolios: {
            include: {
              candidates: {
                select: {
                  id: true,
                  full_name: true,
                  photo_url: true,
                  manifesto: true,
                  portfolio_id: true,
                  election_id: true,
                },
              },
            },
          },
          candidates: {
            select: {
              id: true,
              full_name: true,
              photo_url: true,
              manifesto: true,
              portfolio_id: true,
              election_id: true,
            },
          },
          _count: {
            select: {
              voterTokens: true,
            },
          },
          creator: {
            select: {
              full_name: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip: offset,
        take: limit,
      }),

      // Get total count for pagination
      prisma.elections.count({
        where: whereConditions,
      }),
    ]);

    // Transform the data to match frontend interface
    const formattedElections: Election[] = elections.map((election) => ({
      id: election.id,
      title: election.title,
      description: election.description || "",
      department: election.department || "General",
      isGeneral: election.is_general,
      startDate: election.start_time.toISOString(),
      endDate: election.end_time.toISOString(),
      status: election.status,
      createdBy: (election as any).creator?.full_name || "Unknown",
      createdAt: election.created_at.toISOString(),
      portfolios: (election as any).portfolios.map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        election_id: p.election_id,
      })),
      candidates: (election as any).candidates.map((c: any) => ({
        id: c.id,
        full_name: c.full_name,
        photo_url: c.photo_url,
        manifesto: c.manifesto,
        portfolio_id: c.portfolio_id,
        election_id: c.election_id,
      })),
      expectedVoters: (election as any)._count?.voterTokens || 0,
    }));

    // Get available departments for filtering
    const departments = await prisma.elections.findMany({
      where: { status: "PENDING_APPROVAL" },
      select: { department: true },
      distinct: ["department"],
    });

    const availableDepartments = departments
      .map((d) => d.department)
      .filter((d) => d !== null)
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
        },
      },
    });
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
