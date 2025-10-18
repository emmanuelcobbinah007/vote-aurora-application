import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { validateOrchestratorOrAdmin } from "../../../libs/auth-utils";

// Define the interface for superadmin data
interface SuperAdminData {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

// Function to get all superadmins from the database
export async function GET(request: NextRequest) {
  // Validate authentication and authorization - ORCHESTRATOR and SUPERADMIN can view superadmins
  const authResult = await validateOrchestratorOrAdmin(request);
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.statusCode }
    );
  }

  try {
    // Fetch all users with SUPERADMIN role from the database
    const superadmins = await prisma.users.findMany({
      where: {
        role: "SUPERADMIN",
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
    const formattedSuperAdmins = superadmins.map(
      (superadmin: SuperAdminData) => ({
        id: superadmin.id,
        name: superadmin.full_name,
        email: superadmin.email,
        role: superadmin.role,
        status: superadmin.status,
        createdAt: superadmin.created_at.toISOString(),
        updatedAt: superadmin.updated_at.toISOString(),
      })
    );

    return NextResponse.json({
      success: true,
      data: formattedSuperAdmins,
      count: formattedSuperAdmins.length,
    });
  } catch (error) {
    console.error("Error fetching superadmins:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch superadmins",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}