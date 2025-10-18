import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { validateOrchestratorOrAdmin } from "../../../libs/auth-utils";

// Define the interface for approver data
interface ApproverData {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

// Function to get all approvers from the database
export async function GET(request: NextRequest) {
  // Validate authentication and authorization - ORCHESTRATOR and SUPERADMIN can view approvers
  const authResult = await validateOrchestratorOrAdmin(request);
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.statusCode }
    );
  }

  try {
    // Fetch all users with APPROVER role from the database
    const approvers = await prisma.users.findMany({
      where: {
        role: "APPROVER",
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        created_at: "desc", // Most recent first
      },
    });

    // Transform the data to match the frontend interface
    const formattedApprovers = approvers.map(
      (approver: ApproverData) => ({
        id: approver.id,
        name: approver.full_name,
        email: approver.email,
        role: approver.role,
        status: approver.status,
        createdAt: approver.created_at.toISOString(),
        updatedAt: approver.updated_at.toISOString(),
      })
    );

    return NextResponse.json({
      success: true,
      data: formattedApprovers,
      count: formattedApprovers.length,
    });
  } catch (error) {
    console.error("Error fetching approvers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch approvers",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}