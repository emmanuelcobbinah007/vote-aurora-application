import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from ".prisma/university";

export async function GET(request: NextRequest) {
  const client = new PrismaClient({
    log: ["query", "error", "warn", "info"],
  });

  try {
    console.log("Testing university database connection...");
    console.log("Database URL exists:", !!process.env.UNIVERSITY_DATABASE_URL);
    console.log(
      "Database URL preview:",
      process.env.UNIVERSITY_DATABASE_URL?.substring(0, 50) + "..."
    );

    // Test basic connection
    await client.$connect();
    console.log("✅ Connected to university database successfully!");

    // Test query
    const departments = await client.departments.findMany({
      take: 5, // Limit to 5 for testing
    });
    console.log(`✅ Found ${departments.length} departments`);

    return NextResponse.json({
      success: true,
      message: "University database connection successful",
      departments: departments,
      count: departments.length,
    });
  } catch (error) {
    console.error("❌ University database connection failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: {
          name: error instanceof Error ? error.name : "Unknown",
          code: (error as any)?.code,
          meta: (error as any)?.meta,
        },
      },
      { status: 500 }
    );
  } finally {
    await client.$disconnect();
  }
}
