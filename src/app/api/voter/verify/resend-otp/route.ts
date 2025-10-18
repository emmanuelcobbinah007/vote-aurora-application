// src/app/api/voter/verify/resend-otp/route.ts
import { NextResponse } from "next/server";
import { voterVerificationService } from "@/libs/voterVerificationService";

export async function POST(request: Request) {
  try {
    const { voter_token } = await request.json();

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

    // Validate token format
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
      `📧 OTP resend request for token: ${voter_token.substring(0, 8)}...`
    );

    // Call verification service
    const result = await voterVerificationService.resendOTP(voter_token);

    console.log(`✅ OTP resent successfully`);

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ OTP resend failed:", error);

    // Handle specific error types
    if (error instanceof Error) {
      // Rate limiting errors
      if (error.message.includes("Maximum OTP requests exceeded")) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Maximum verification attempts exceeded. Please contact support for assistance.",
          },
          { status: 429 }
        );
      }

      if (error.message.includes("Please wait")) {
        return NextResponse.json(
          {
            success: false,
            error: error.message, // Contains specific wait time
          },
          { status: 429 }
        );
      }

      // Invalid token errors
      if (
        error.message.includes("not found") ||
        error.message.includes("expired")
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid or expired voting link. Please request a new voting link.",
          },
          { status: 404 }
        );
      }

      // Election status errors
      if (error.message.includes("not currently active")) {
        return NextResponse.json(
          {
            success: false,
            error: "This election is no longer accepting votes.",
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
        error: "Failed to resend verification code. Please try again.",
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
      error: "Method not allowed. Use POST to resend verification code.",
    },
    { status: 405 }
  );
}
