import { NextRequest, NextResponse } from "next/server";
import { universityPrisma } from "@/libs/university-prisma";
import { mockDepartments } from "@/data/departments";

export async function GET(request: NextRequest) {
  try {
    console.log(
      "🔍 Attempting to fetch departments from university database..."
    );

    // First, try to connect to the university database with raw query to avoid schema issues
    const departments = await universityPrisma.$queryRaw`
      SELECT id, name FROM departments 
      WHERE is_active = true 
      ORDER BY name ASC
    `;

    console.log(
      `✅ Successfully fetched ${
        Array.isArray(departments) ? departments.length : "unknown"
      } departments from university database`
    );

    // Transform the data to match expected frontend format
    const transformedDepartments = (departments as any[]).map(
      (dept: { id: number; name: string }) => ({
        id: dept.id.toString(),
        name: dept.name,
        code: dept.name.toUpperCase().replace(/\s+/g, ""), // Generate code from name
        faculty: "General", // Default faculty since it's not in the university schema
      })
    );

    return NextResponse.json({
      success: true,
      data: transformedDepartments,
      source: "university_database",
    });
  } catch (error) {
    console.error("❌ University database query failed:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown",
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });

    // If university database is unavailable, return mock departments as fallback
    const fallbackDepartments = mockDepartments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      code: dept.code,
      faculty: dept.faculty,
    }));

    return NextResponse.json({
      success: true,
      data: fallbackDepartments,
      source: "mock_data",
      warning: "University database temporarily unavailable, using cached data",
    });
  }
}
