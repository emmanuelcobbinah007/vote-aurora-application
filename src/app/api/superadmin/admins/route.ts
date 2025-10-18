import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { validateSuperAdmin, createAuthErrorResponse } from "@/libs/auth-utils";
import crypto from "crypto";
import EmailService from "@/libs/email";

// GET: List all admins
export async function GET(request: NextRequest) {
  const authResult = await validateSuperAdmin(request);
  if (!authResult.success) {
    return createAuthErrorResponse(authResult);
  }

  try {
    const admins = await prisma.users.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        status: true,
        created_at: true,
        updated_at: true,
        last_login: true,
        _count: {
          select: {
            adminAssignments: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Transform data to include assignment count
    const formattedAdmins = admins.map((admin) => ({
      id: admin.id,
      full_name: admin.full_name,
      email: admin.email,
      status: admin.status,
      created_at: admin.created_at.toISOString(),
      updated_at: admin.updated_at.toISOString(),
      last_login: admin.last_login?.toISOString() || null,
      assignments_count: admin._count.adminAssignments,
    }));

    return NextResponse.json({
      success: true,
      data: formattedAdmins,
      count: formattedAdmins.length,
    });
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch admins",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST: Invite a new admin
export async function POST(request: NextRequest) {
  const authResult = await validateSuperAdmin(request);
  if (!authResult.success) {
    return createAuthErrorResponse(authResult);
  }

  try {
    const body = await request.json();
    const { email, full_name } = body;

    // Validate required fields
    if (!email || !full_name) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: email and full_name",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email format",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User with this email already exists",
        },
        { status: 409 }
      );
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.invitationTokens.findFirst({
      where: {
        email,
        used: false,
        expires_at: {
          gte: new Date(),
        },
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        {
          success: false,
          error: "Pending invitation already exists for this email",
        },
        { status: 409 }
      );
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Create invitation token
    const invitation = await prisma.invitationTokens.create({
      data: {
        email,
        token,
        role: "ADMIN",
        expires_at: expiresAt,
        created_by: authResult.user!.id,
      },
    });

    // Send invitation email
    const emailService = new EmailService();
    const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?token=${token}`;
    
    try {
      await emailService.sendAdminInvitationEmail(
        email,
        invitationLink,
        authResult.user!.fullName
      );
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      // Delete the invitation token if email fails
      await prisma.invitationTokens.delete({
        where: { id: invitation.id },
      });
      
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send invitation email",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expires_at: invitation.expires_at.toISOString(),
        invited_by: authResult.user!.fullName,
      },
      message: `Admin invitation sent successfully to ${email}`,
    });
  } catch (error) {
    console.error("Error creating admin invitation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create admin invitation",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}