import { NextRequest, NextResponse } from "next/server";
import { universityPrisma } from "@/libs/university-prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Fetching students from university database...");

    // Check if students table exists first
    const tableExists = (await universityPrisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'students'
      ) as exists;
    `) as any[];

    if (!tableExists[0]?.exists) {
      console.log("❌ Students table does not exist in university database");
      return NextResponse.json(
        {
          success: false,
          error: "Students table not found in university database",
          message:
            "University database integration incomplete - students table not created yet",
        },
        { status: 404 }
      );
    }

    const students = await universityPrisma.$queryRaw`
      SELECT s.student_id, s.email, s.name, s.department_id, d.name as department_name
      FROM students s
      JOIN departments d ON s.department_id = d.id
      WHERE s.is_active = true
      ORDER BY s.name ASC
    `;

    console.log(
      `✅ Found ${
        Array.isArray(students) ? students.length : "unknown"
      } students`
    );

    return NextResponse.json({
      success: true,
      data: students,
      source: "university_database",
    });
  } catch (error) {
    console.error("❌ University database students query failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch students from university database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if students table exists first
    const tableExists = (await universityPrisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'students'
      ) as exists;
    `) as any[];

    if (!tableExists[0]?.exists) {
      return NextResponse.json(
        {
          success: false,
          error: "Students table not found in university database",
          message:
            "Cannot add students until the university database schema is updated",
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { student_id, email, name, department_id } = body;

    if (!student_id || !email || !name || !department_id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: student_id, email, name, department_id",
        },
        { status: 400 }
      );
    }

    // Check if department exists
    const department = (await universityPrisma.$queryRaw`
      SELECT id FROM departments WHERE id = $1 AND is_active = true
    `) as any[];

    if (department.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Department with ID ${department_id} not found`,
        },
        { status: 400 }
      );
    }

    // Insert student
    await universityPrisma.$queryRaw`
      INSERT INTO students (student_id, email, name, department_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (student_id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        department_id = EXCLUDED.department_id,
        updated_at = NOW()
    `;

    return NextResponse.json({
      success: true,
      message: "Student added/updated successfully",
    });
  } catch (error) {
    console.error("❌ Failed to add student:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to add student to university database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
