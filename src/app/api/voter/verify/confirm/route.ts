import { NextResponse } from "next/server";
import { voterVerificationService } from "@/libs/voterVerificationService";

export async function POST(request: Request) {
  try {
    const { voter_token, student_id, otp } = await request.json();

    // Validate required fields
    if (!voter_token || !student_id || !otp) {
      return NextResponse.json(
        {
          success: false,
          error: "Voter token, student ID, and verification code are required",
        },
        { status: 400 }
      );
    }

    // Validate field formats
    if (typeof voter_token !== "string" || voter_token.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid voter token format",
        },
        { status: 400 }
      );
    }

    if (typeof student_id !== "string" || student_id.trim().length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid student ID format",
        },
        { status: 400 }
      );
    }

    if (typeof otp !== "string" || !/^\d{6}$/.test(otp.trim())) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification code must be 6 digits",
        },
        { status: 400 }
      );
    }

    console.log(
      `🔐 Verification attempt for student: ${student_id.toUpperCase()}`
    );

    // Call verification service
    const result = await voterVerificationService.verifyCredentials(
      voter_token,
      student_id.trim(),
      otp.trim()
    );

    console.log(
      `✅ Verification successful for student: ${student_id.toUpperCase()}`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Credential verification failed:", error);

    // Handle specific error types
    if (error instanceof Error) {
      // Rate limiting errors
      if (error.message.includes("Too many failed attempts")) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Too many failed verification attempts. Please request a new verification code.",
          },
          { status: 429 }
        );
      }

      // Invalid credentials
      if (error.message.includes("Invalid student ID")) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Student ID does not match the voting link. Please check your student ID.",
          },
          { status: 400 }
        );
      }

      if (error.message.includes("Invalid verification code")) {
        return NextResponse.json(
          {
            success: false,
            error: error.message, // This includes remaining attempts info
          },
          { status: 400 }
        );
      }

      // Expired codes
      if (error.message.includes("expired")) {
        return NextResponse.json(
          {
            success: false,
            error: "Verification code has expired. Please request a new one.",
          },
          { status: 410 }
        );
      }

      // Invalid session
      if (error.message.includes("Invalid voting session")) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid voting session. Please start the verification process again.",
          },
          { status: 404 }
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
        error: "Verification failed. Please try again.",
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
      error: "Method not allowed. Use POST to confirm verification.",
    },
    { status: 405 }
  );
}
