import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { AuditTrailService } from "@/libs/auditTrailService";

/**
 * Brevo Webhook Handler
 * Receives email delivery events from Brevo and logs them to the database
 *
 * Webhook URL: https://yourdomain.com/api/webhooks/brevo
 *
 * Configure in Brevo Dashboard:
 * Settings → Webhooks → Add new webhook
 * Events to subscribe: delivered, hard_bounce, soft_bounce, invalid_email, blocked, spam
 */
export async function POST(request: NextRequest) {
  try {
    const events = await request.json();
    console.log(
      `📨 Received ${
        Array.isArray(events) ? events.length : 1
      } webhook event(s) from Brevo`
    );

    // Brevo sends events as an array
    const eventArray = Array.isArray(events) ? events : [events];

    for (const event of eventArray) {
      const {
        email,
        event: eventType,
        "message-id": messageId,
        date,
        reason,
        tag,
      } = event;

      console.log(`Processing event: ${eventType} for ${email}`);

      // Map Brevo events to our statuses
      const statusMap: Record<string, string> = {
        delivered: "delivered",
        hard_bounce: "bounced",
        soft_bounce: "bounced",
        invalid_email: "error",
        blocked: "spam",
        spam: "spam",
        deferred: "pending",
        opened: "opened",
        click: "clicked",
      };

      const status = statusMap[eventType] || "unknown";

      // Update delivery status in database
      await AuditTrailService.log({
        user_id: "system",
        action: "EMAIL_WEBHOOK_RECEIVED",
        metadata: {
          email,
          status,
          eventType,
          messageId: messageId || "unknown",
          timestamp: date || new Date().toISOString(),
          reason: reason || null,
          tag: tag || null,
        },
      });

      // If bounce or spam, handle specially
      if (status === "bounced" || status === "spam" || status === "error") {
        await handleBouncedEmail(email, messageId, eventType, reason);
      }
    }

    return NextResponse.json({
      success: true,
      processed: eventArray.length,
    });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}

/**
 * Handle bounced emails by logging them and flagging voter tokens
 */
async function handleBouncedEmail(
  email: string,
  messageId: string,
  eventType: string,
  reason?: string
) {
  try {
    // Find voter token by email
    const voterToken = await prisma.voterTokens.findFirst({
      where: { student_email: email },
      orderBy: { created_at: "desc" }, // Get most recent token
    });

    if (voterToken) {
      // Log bounce for election admins to review
      await AuditTrailService.log({
        user_id: "system",
        election_id: voterToken.election_id,
        action: "VOTER_EMAIL_BOUNCED",
        metadata: {
          student_id: voterToken.student_id,
          student_email: email,
          messageId: messageId || "unknown",
          token_id: voterToken.id,
          bounce_type: eventType,
          bounce_reason: reason || "Not provided",
          timestamp: new Date().toISOString(),
        },
      });

      console.warn(
        `⚠️ Email bounced for student ${voterToken.student_id}: ${email} (${eventType})`
      );
    } else {
      // Could be an admin/approver email or other system email
      console.warn(`⚠️ Email bounced for ${email}, but no voter token found`);
    }
  } catch (error) {
    console.error("Error handling bounced email:", error);
    // Don't throw - we still want to acknowledge the webhook
  }
}

// Verify webhook signature (optional but recommended for production)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Brevo webhook endpoint is active",
    instructions:
      "Configure this URL in your Brevo dashboard under Settings → Webhooks",
  });
}
