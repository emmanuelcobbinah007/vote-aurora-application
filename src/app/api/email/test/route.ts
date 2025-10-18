import { NextRequest, NextResponse } from "next/server";
import { emailService } from "../../../../libs/email";

export async function GET(request: NextRequest) {
  try {
    // Test email connection
    const isConnected = await emailService.testConnection();

    if (!isConnected) {
      return NextResponse.json(
        {
          error: "Email service connection failed",
          details:
            "Please check your SMTP configuration in environment variables",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Email service is configured correctly",
      smtp_host: process.env.SMTP_HOST,
      smtp_port: process.env.SMTP_PORT,
      from_email: process.env.FROM_EMAIL,
    });
  } catch (error) {
    console.error("Email test failed:", error);
    return NextResponse.json(
      {
        error: "Email service test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { to, subject = "Test Email" } = await request.json();

    if (!to) {
      return NextResponse.json(
        { error: "Recipient email is required" },
        { status: 400 }
      );
    }

    await emailService.sendEmail({
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Email Test Successful! 🎉</h2>
          <p>This is a test email from the University E-Voting System.</p>
          <p>If you received this email, your email configuration is working correctly.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>Configuration Details:</strong><br>
            SMTP Host: ${process.env.SMTP_HOST}<br>
            SMTP Port: ${process.env.SMTP_PORT}<br>
            From: ${process.env.FROM_EMAIL}
          </div>
          <p style="color: #666; font-size: 12px;">
            Sent at: ${new Date().toISOString()}
          </p>
        </div>
      `,
      text: `
Email Test Successful!

This is a test email from the University E-Voting System.
If you received this email, your email configuration is working correctly.

Configuration Details:
SMTP Host: ${process.env.SMTP_HOST}
SMTP Port: ${process.env.SMTP_PORT}
From: ${process.env.FROM_EMAIL}

Sent at: ${new Date().toISOString()}
      `,
    });

    return NextResponse.json({
      message: "Test email sent successfully",
      to,
      subject,
    });
  } catch (error) {
    console.error("Test email failed:", error);
    return NextResponse.json(
      {
        error: "Failed to send test email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
