// src/libs/emailAnalytics.ts
import prisma from "./prisma";

export interface EmailStats {
  sent: number;
  delivered: number;
  bounced: number;
  spam: number;
  errors: number;
  pending: number;
  opened?: number;
  clicked?: number;
}

/**
 * Get email delivery statistics for a specific election
 */
export async function getElectionEmailStats(
  electionId: string
): Promise<EmailStats> {
  const emailLogs = await prisma.auditTrail.findMany({
    where: {
      election_id: electionId,
      action: {
        in: ["EMAIL_DELIVERY_STATUS", "EMAIL_WEBHOOK_RECEIVED"],
      },
    },
    orderBy: {
      timestamp: "desc",
    },
  });

  const stats: EmailStats = {
    sent: 0,
    delivered: 0,
    bounced: 0,
    spam: 0,
    errors: 0,
    pending: 0,
    opened: 0,
    clicked: 0,
  };

  // Use a Map to track the latest status for each email
  const latestStatuses = new Map<string, string>();

  emailLogs.forEach((log) => {
    const metadata = log.metadata as any;
    const email = metadata.email;
    const status = metadata.status;

    // Update with latest status for this email
    if (!latestStatuses.has(email)) {
      latestStatuses.set(email, status);
    }
  });

  // Count final statuses
  latestStatuses.forEach((status) => {
    if (status === "sent") stats.sent++;
    else if (status === "delivered") stats.delivered++;
    else if (status === "bounced") stats.bounced++;
    else if (status === "spam") stats.spam++;
    else if (status === "error") stats.errors++;
    else if (status === "pending") stats.pending++;
    else if (status === "opened") stats.opened!++;
    else if (status === "clicked") stats.clicked!++;
  });

  return stats;
}

/**
 * Get list of bounced emails for an election
 */
export async function getBouncedEmailsForElection(electionId: string) {
  const bouncedLogs = await prisma.auditTrail.findMany({
    where: {
      election_id: electionId,
      action: "VOTER_EMAIL_BOUNCED",
    },
    orderBy: {
      timestamp: "desc",
    },
  });

  return bouncedLogs.map((log) => {
    const metadata = log.metadata as any;
    return {
      student_id: metadata.student_id,
      student_email: metadata.student_email,
      bounce_type: metadata.bounce_type,
      bounce_reason: metadata.bounce_reason,
      timestamp: metadata.timestamp,
    };
  });
}

/**
 * Get overall email statistics across all elections
 */
export async function getOverallEmailStats(): Promise<EmailStats> {
  const emailLogs = await prisma.auditTrail.findMany({
    where: {
      action: {
        in: ["EMAIL_DELIVERY_STATUS", "EMAIL_WEBHOOK_RECEIVED"],
      },
    },
  });

  const stats: EmailStats = {
    sent: 0,
    delivered: 0,
    bounced: 0,
    spam: 0,
    errors: 0,
    pending: 0,
    opened: 0,
    clicked: 0,
  };

  // Use a Map to track the latest status for each email
  const latestStatuses = new Map<string, string>();

  emailLogs.forEach((log) => {
    const metadata = log.metadata as any;
    const email = metadata.email;
    const status = metadata.status;

    // Update with latest status for this email
    if (!latestStatuses.has(email)) {
      latestStatuses.set(email, status);
    }
  });

  // Count final statuses
  latestStatuses.forEach((status) => {
    if (status === "sent") stats.sent++;
    else if (status === "delivered") stats.delivered++;
    else if (status === "bounced") stats.bounced++;
    else if (status === "spam") stats.spam++;
    else if (status === "error") stats.errors++;
    else if (status === "pending") stats.pending++;
    else if (status === "opened") stats.opened!++;
    else if (status === "clicked") stats.clicked!++;
  });

  return stats;
}
