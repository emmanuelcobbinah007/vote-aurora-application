import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Filter parameters
    const action = searchParams.get("action");
    const entityType = searchParams.get("entityType");
    const userId = searchParams.get("userId");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    // Build where clause based on filters
    const where: any = {
      // Exclude orchestrator-related actions
      NOT: {
        OR: [
          { action: { contains: "ORCHESTRATOR" } },
          { user: { role: "ORCHESTRATOR" } },
        ],
      },
    };

    if (action) {
      where.action = action;
    }

    if (entityType) {
      // Map frontend entity types to database values if needed
      where.action = {
        contains: entityType.toUpperCase(),
      };
    }

    if (userId) {
      where.user_id = userId;
    }

    if (fromDate || toDate) {
      where.timestamp = {};
      if (fromDate) {
        where.timestamp.gte = new Date(fromDate);
      }
      if (toDate) {
        where.timestamp.lte = new Date(toDate + "T23:59:59.999Z");
      }
    }

    // Fetch audit trail records with user information
    const auditLogs = await prisma.auditTrail.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
      skip: offset,
    });

    // Transform to match frontend interface
    const transformedLogs = auditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      userId: log.user_id,
      userName: log.user?.full_name || "Unknown User",
      userEmail: log.user?.email || "unknown@email.com",
      entityType: extractEntityType(log.action),
      entityId: log.election_id, // Most of our actions are election-related
      details: log.metadata ? JSON.stringify(log.metadata) : null,
      ipAddress: null, // We don't store IP addresses currently
      userAgent: null, // We don't store user agents currently
      timestamp: log.timestamp.toISOString(),
    }));

    // Get total count for pagination
    const totalCount = await prisma.auditTrail.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      logs: transformedLogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

// Helper function to extract entity type from action
function extractEntityType(action: string): string {
  if (action.includes("ELECTION")) return "ELECTION";
  if (action.includes("USER") || action.includes("ADMIN")) return "USER";
  if (action.includes("INVITATION")) return "INVITATION";
  if (action.includes("VOTE")) return "VOTE";
  if (action.includes("CANDIDATE")) return "CANDIDATE";
  if (action.includes("PORTFOLIO")) return "PORTFOLIO";
  return "SYSTEM";
}
