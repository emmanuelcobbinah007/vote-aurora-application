import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { validateOrchestratorOrAdmin } from "../../../libs/auth-utils";

// Define the interface for orchestrator data
interface OrchestratorData {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

// function to get all orchestrators from the database
export async function GET(request: NextRequest) {
  // Validate authentication and authorization - ORCHESTRATOR and SUPERADMIN can view orchestrators
  const authResult = await validateOrchestratorOrAdmin(request);
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.statusCode }
    );
  }

  try {
    // Fetch all users with ORCHESTRATOR role from the database
    const orchestrators = await prisma.users.findMany({
      where: {
        role: "ORCHESTRATOR",
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
    const formattedOrchestrators = orchestrators.map(
      (orchestrator: OrchestratorData) => ({
        id: orchestrator.id,
        name: orchestrator.full_name,
        email: orchestrator.email,
        role: orchestrator.role,
        status: orchestrator.status,
        createdAt: orchestrator.created_at.toISOString(),
      })
    );

    return NextResponse.json({
      success: true,
      data: formattedOrchestrators,
      count: formattedOrchestrators.length,
    });
  } catch (error) {
    console.error("Error fetching orchestrators:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orchestrators",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
