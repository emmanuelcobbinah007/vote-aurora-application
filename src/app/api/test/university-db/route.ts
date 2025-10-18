// Create src/app/api/test/university-db/route.ts
import { NextResponse } from "next/server";
import { testUniversityConnection } from "@/libs/university-prisma";

export async function GET() {
  try {
    const isConnected = await testUniversityConnection();

    return NextResponse.json({
      success: isConnected,
      message: isConnected
        ? "University database connection successful"
        : "University database connection failed",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Connection test failed",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
