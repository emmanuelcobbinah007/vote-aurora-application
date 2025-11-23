import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { AuditTrailService } from "@/libs/auditTrailService";

/**
 * Verify the integrity of the audit trail hash chain
 * Only accessible to SUPERADMIN users
 */
export async function GET() {
  try {
    // requireRole handles authentication and authorization
    const authResult = await requireRole(["SUPERADMIN"]);
    
    // If authResult is a NextResponse, it's an error response
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    console.log("🔍 Verifying audit trail integrity...");

    const result = await AuditTrailService.verifyIntegrity();

    if (!result.isValid) {
      console.error(`❌ Audit trail integrity compromised!`);
      console.error(
        `Corrupted entries: ${result.corruptedEntries.join(", ")}`
      );

      // This is a CRITICAL security issue - should trigger immediate alerts
      return NextResponse.json(
        {
          success: false,
          totalEntries: result.totalEntries,
          corruptedEntries: result.corruptedEntries,
          corruptedCount: result.corruptedEntries.length,
          message: "⚠️ CRITICAL: Audit trail has been tampered with!",
          severity: "CRITICAL",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      totalEntries: result.totalEntries,
      corruptedEntries: [],
      corruptedCount: 0,
      message: `✅ Audit trail integrity verified (${result.totalEntries} entries)`,
      severity: "INFO",
    });
  } catch (error) {
    console.error("Integrity check error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to verify audit trail",
      },
      { status: 500 }
    );
  }
}
