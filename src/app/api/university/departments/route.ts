import { NextRequest, NextResponse } from "next/server";
import { universityPrisma } from "@/libs/university-prisma";
import { mockDepartments } from "@/data/departments";

export async function GET(request: NextRequest) {
  try {
    // First, try to connect to the university database with timeout
    const departments = await universityPrisma.departments.findMany({
      orderBy: {
        name: "asc",
      },
    });

    // Transform the data to match expected frontend format
    const transformedDepartments = departments.map(
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
    console.error(
      "University database unavailable, falling back to mock data:",
      error
    );

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
