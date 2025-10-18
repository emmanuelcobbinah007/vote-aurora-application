import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { validateOrchestratorOrAdmin } from "../../../libs/auth-utils";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../libs/auth";

export async function GET(request: NextRequest) {
  // Validate authentication and authorization
  const authResult = await validateOrchestratorOrAdmin(request);
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.statusCode }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const action = searchParams.get("action");
    const userId = searchParams.get("userId");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    // Build where clause for filtering
    const where: any = {};

    if (action) {
      where.action = action;
    }

    if (userId) {
      where.user_id = userId;
    }

    // Note: Both ORCHESTRATOR and SUPERADMIN can see all audit logs
    // Only restrict access for other roles (if any are added in the future)
    // Currently, only ORCHESTRATOR and SUPERADMIN roles are allowed by validateOrchestratorOrAdmin

    if (fromDate || toDate) {
      where.timestamp = {};
      if (fromDate) {
        where.timestamp.gte = new Date(fromDate);
      }
      if (toDate) {
        where.timestamp.lte = new Date(toDate);
      }
    }

    // Fetch audit trail entries with user details
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
        election: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.auditTrail.count({ where });

    // Transform the data to match the frontend interface
    const transformedLogs = auditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      userId: log.user_id,
      userName: log.user?.full_name || "System",
      userEmail: log.user?.email || "system@example.com",
      userRole: log.user?.role || "SYSTEM",
      entityType: log.election_id ? "ELECTION" : "SYSTEM",
      entityId: log.election_id,
      entityName: log.election?.title || null,
      details: JSON.stringify(log.metadata),
      timestamp: log.timestamp.toISOString(),
      metadata: log.metadata,
    }));

    return NextResponse.json({
      logs: transformedLogs,
      totalCount,
      hasMore: offset + limit < totalCount,
    });
  } catch (error) {
    console.error("Error fetching audit trail:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit trail" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    
    if (!body.action) {
      return NextResponse.json(
        { success: false, message: "Action is required" },
        { status: 400 }
      );
    }

    // Create the audit trail entry
    const auditEntry = await prisma.auditTrail.create({
      data: {
        user_id: session.user.id,
        action: body.action,
        election_id: body.entityId || null,
        metadata: {
          ...(body.metadata || {}),
          entityType: body.entityType || "SYSTEM"
        },
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      id: auditEntry.id,
    });
  } catch (error) {
    console.error("Error creating audit trail entry:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create audit trail entry" },
      { status: 500 }
    );
  }
}