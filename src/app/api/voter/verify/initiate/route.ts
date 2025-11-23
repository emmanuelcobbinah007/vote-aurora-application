import { NextResponse } from "next/server";
import { voterVerificationService } from "@/libs/voterVerificationService";
import { rateLimit } from "@/lib/rateLimit";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const { voter_token } = await request.json();
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = headersList.get("user-agent") || "Unknown";

    // Rate Limiting
    const { success: limitSuccess } = await rateLimit.limit(ip);
    if (!limitSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many requests. Please try again later.",
        },
        { status: 429 }
      );
    }

    // Validate required fields
    if (!voter_token) {
      return NextResponse.json(
        {
          success: false,
          error: "Voter token is required",
        },
        { status: 400 }
      );
    }

    // Validate token format (basic check)
    if (typeof voter_token !== "string" || voter_token.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid voter token format",
        },
        { status: 400 }
      );
    }

    console.log(
      `🔍 Verification initiation request for token: ${voter_token.substring(
        0,
        8
      )}...`
    );

    // Call verification service
    const result = await voterVerificationService.initiateVerification(
      voter_token,
      ip,
      userAgent
    );

    console.log(
      `✅ Verification initiated successfully for student: ${result.data.student_id}`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Verification initiation failed:", error);

    // Handle specific error types
    if (error instanceof Error) {
      // Return user-friendly error messages
      if (
        error.message.includes("not found") ||
        error.message.includes("expired")
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid or expired voting link. Please contact the election administrators.",
          },
          { status: 404 }
        );
      }

      if (error.message.includes("not currently active")) {
        return NextResponse.json(
          {
            success: false,
            error: "This election is not currently accepting votes.",
          },
          { status: 403 }
        );
      }

      if (error.message.includes("ended")) {
        return NextResponse.json(
          {
            success: false,
            error: "The voting period for this election has ended.",
          },
          { status: 403 }
        );
      }

      // Generic error response
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    // Fallback error
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed. Use POST to initiate verification.",
    },
    { status: 405 }
  );
}
