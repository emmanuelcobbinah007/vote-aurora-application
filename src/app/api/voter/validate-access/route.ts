import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";

export async function POST(request: Request) {
  try {
    const { access_token } = await request.json();

    // Validate required fields
    if (!access_token) {
      return NextResponse.json(
        {
          success: false,
          error: "Access token is required",
        },
        { status: 400 }
      );
    }

    console.log(
      `🔍 Validating access token: ${access_token.substring(0, 8)}...`
    );

    // Find the voter token record with this access token
    const voterRecord = await prisma.voterTokens.findFirst({
      where: {
        access_token: access_token,
        used: false, // Token hasn't been used to vote yet
      },
      include: {
        election: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            end_time: true,
            is_general: true,
            department: true,
          },
        },
      },
    });

    if (!voterRecord) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid access token or vote already submitted",
        },
        { status: 404 }
      );
    }

    // Check if access token has expired
    if (
      voterRecord.access_token_expires_at &&
      new Date() > voterRecord.access_token_expires_at
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Access token has expired. Please verify again.",
        },
        { status: 410 }
      );
    }

    // Check if election is still active
    if (voterRecord.election.status !== "LIVE") {
      return NextResponse.json(
        {
          success: false,
          error: "Election is no longer active",
        },
        { status: 403 }
      );
    }

    // Check if voting period has ended
    if (new Date() > voterRecord.election.end_time) {
      return NextResponse.json(
        {
          success: false,
          error: "Voting period has ended",
        },
        { status: 403 }
      );
    }

    // Check if voter was verified
    if (!voterRecord.verified_at) {
      return NextResponse.json(
        {
          success: false,
          error: "Voter verification incomplete",
        },
        { status: 401 }
      );
    }

    console.log(
      `✅ Access token validated for student: ${voterRecord.student_id}`
    );

    // Return voter and election data
    return NextResponse.json({
      success: true,
      message: "Access granted to ballot",
      data: {
        voter: {
          id: voterRecord.id,
          student_id: voterRecord.student_id,
          verified_at: voterRecord.verified_at,
        },
        election: {
          id: voterRecord.election.id,
          title: voterRecord.election.title,
          description: voterRecord.election.description,
          is_general: voterRecord.election.is_general,
          department: voterRecord.election.department,
          end_time: voterRecord.election.end_time,
        },
        session: {
          expires_at: voterRecord.access_token_expires_at,
          time_remaining: voterRecord.access_token_expires_at
            ? Math.max(
                0,
                Math.floor(
                  (new Date(voterRecord.access_token_expires_at).getTime() -
                    Date.now()) /
                    1000
                )
              )
            : null,
        },
      },
    });
  } catch (error) {
    console.error("❌ Access token validation failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Access validation failed. Please try again.",
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
      error: "Method not allowed. Use POST to validate access token.",
    },
    { status: 405 }
  );
}
