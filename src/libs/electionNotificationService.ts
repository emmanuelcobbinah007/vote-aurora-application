import { emailService } from "@/libs/email";
import prisma from "@/libs/prisma";

interface Election {
  id: string;
  title: string;
  description: string;
  start_time: Date;
  end_time: Date;
  is_general: boolean;
  department: string | null;
  total_eligible_voters: number | null;
  creator: { id: string; full_name: string; email: string };
  approver?: { id: string; full_name: string; email: string } | null;
}

export class ElectionNotificationService {
  async sendElectionClosureNotifications(electionId: string) {
    console.log(`Sending closure notifications for election: ${electionId}`);

    try {
      // Get election details with creator and approver
      const election = await this.getElectionWithAdmins(electionId);

      // Get voting statistics
      const stats = await this.getElectionStats(electionId);

      // Get superadmins
      const superAdmins = await this.getSuperAdmins();

      // Prepare notification recipients
      const recipients = this.prepareRecipients(election, superAdmins);

      console.log(
        `📋 Sending closure notifications to ${recipients.length} administrators`
      );

      // Send notifications
      const results = await this.sendClosureEmails(election, stats, recipients);

      // Log notification in audit trail
      await this.logClosureNotifications(electionId, results);

      return {
        success: true,
        election_id: electionId,
        election_title: election.title,
        notifications_sent: results.successful.length,
        notifications_failed: results.failed.length,
        recipients: recipients.map((r) => ({
          name: r.full_name,
          email: r.email,
          role: r.role,
        })),
      };
    } catch (error) {
      console.error(
        `❌ Failed to send closure notifications for election ${electionId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get election details with creator and approver
   */
  private async getElectionWithAdmins(electionId: string): Promise<Election> {
    const election = await prisma.elections.findUnique({
      where: { id: electionId },
      include: {
        creator: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    if (!election) {
      throw new Error(`Election ${electionId} not found`);
    }

    return election as Election;
  }

  /**
   * Get election voting statistics
   */
  private async getElectionStats(electionId: string) {
    const [totalTokens, usedTokens, totalVotes] = await Promise.all([
      prisma.voterTokens.count({
        where: { election_id: electionId },
      }),
      prisma.voterTokens.count({
        where: { election_id: electionId, used: true },
      }),
      // Assuming you have a Votes table - adjust based on your schema
      prisma.votes?.count?.({
        where: { election_id: electionId },
      }) || 0,
    ]);

    const turnoutPercentage =
      totalTokens > 0 ? ((usedTokens / totalTokens) * 100).toFixed(1) : "0.0";

    return {
      total_eligible: totalTokens,
      total_voted: usedTokens,
      total_votes: totalVotes,
      turnout_percentage: turnoutPercentage,
    };
  }

  /**
   * Get all superadmins
   */
  private async getSuperAdmins() {
    return await prisma.users.findMany({
      where: {
        role: "SUPERADMIN",
        status: "ACTIVE",
      },
      select: {
        id: true,
        full_name: true,
        email: true,
      },
    });
  }

  /**
   * Prepare list of notification recipients
   */
  private prepareRecipients(election: Election, superAdmins: any[]) {
    interface Recipient {
      id: string;
      full_name: string;
      email: string;
      role: string;
    }
    const recipients: Recipient[] = [];

    // Add election creator (admin in charge)
    recipients.push({
      ...election.creator,
      role: "Election Creator",
    });

    // Add election approver if different from creator
    if (election.approver && election.approver.id !== election.creator.id) {
      recipients.push({
        ...election.approver,
        role: "Election Approver",
      });
    }

    // Add all superadmins
    superAdmins.forEach((admin) => {
      // Avoid duplicates if superadmin is also creator/approver
      if (!recipients.find((r) => r.id === admin.id)) {
        recipients.push({
          ...admin,
          role: "Super Administrator",
        });
      }
    });

    return recipients;
  }

  /**
   * Send closure emails to all recipients
   */
  private async sendClosureEmails(
    election: Election,
    stats: any,
    recipients: any[]
  ) {
    const results: {
      successful: { name: string; email: string; role: string }[];
      failed: { name: string; email: string; role: string; error: string }[];
    } = {
      successful: [],
      failed: [],
    };

    for (const recipient of recipients) {
      try {
        const emailContent = this.generateClosureEmailContent(
          election,
          stats,
          recipient
        );

        await emailService.sendEmail({
          to: recipient.email,
          subject: `Election Closed: ${election.title}`,
          html: emailContent.html,
          text: emailContent.text,
        });

        results.successful.push({
          name: recipient.full_name,
          email: recipient.email,
          role: recipient.role,
        });

        console.log(
          `✅ Closure notification sent to ${recipient.full_name} (${recipient.role})`
        );
      } catch (error) {
        results.failed.push({
          name: recipient.full_name,
          email: recipient.email,
          role: recipient.role,
          error: error instanceof Error ? error.message : String(error),
        });

        console.error(
          `❌ Failed to send closure notification to ${recipient.full_name}:`,
          error
        );
      }
    }

    return results;
  }

  /**
   * Generate closure email content - clean design matching new template
   */
  private generateClosureEmailContent(
    election: Election,
    stats: any,
    recipient: any
  ) {
    const closedTime = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const startTime = election.start_time.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const endTime = election.end_time.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const bodyContent = `
      <p>Dear <strong>${recipient.full_name}</strong>,</p>
      <p>The election "<strong>${
        election.title
      }</strong>" has been automatically closed as the voting period has ended.</p>

      <div class="info-box">
        <h3>Election Summary</h3>
        <p><strong>Election:</strong> ${election.title}</p>
        <p><strong>Type:</strong> ${
          election.is_general
            ? "General Election"
            : `Department Election (${election.department})`
        }</p>
        <p><strong>Duration:</strong> ${startTime} - ${endTime}</p>
        <p><strong>Closed:</strong> ${closedTime}</p>
        <p><strong>Creator:</strong> ${election.creator.full_name}</p>
        ${
          election.approver
            ? `<p><strong>Approved by:</strong> ${election.approver.full_name}</p>`
            : ""
        }
      </div>

      ${
        election.description
          ? `
      <div class="info-box">
        <h3>Election Description</h3>
        <p>${election.description}</p>
      </div>
      `
          : ""
      }

      <div class="success-box">
        <h3>Voting Statistics</h3>
        <p><strong>Eligible Voters:</strong> ${stats.total_eligible}</p>
        <p><strong>Votes Cast:</strong> ${stats.total_voted}</p>
        <p><strong>Voter Turnout:</strong> ${stats.turnout_percentage}%</p>
        <p><strong>Total Votes Recorded:</strong> ${stats.total_votes}</p>
      </div>

      <div class="warning-box">
        <h3>Next Steps</h3>
        <ul>
          <li>Verify voting results in the admin dashboard</li>
          <li>Review audit logs for any irregularities</li>
          <li>Prepare results announcement if applicable</li>
          <li>Archive election data as per policy</li>
        </ul>
      </div>
    `;

    const html = emailService.getSimpleTemplate(
      "Election Closed",
      bodyContent,
      "View Election Results",
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/admin/elections/${
        election.id
      }`
    );

    const text = `
VoteUPSA
Election Closed: ${election.title}

Dear ${recipient.full_name},

The election "${
      election.title
    }" has been automatically closed as the voting period has ended.

Election Summary:
- Election: ${election.title}
- Type: ${
      election.is_general
        ? "General Election"
        : `Department Election (${election.department})`
    }
- Duration: ${startTime} - ${endTime}
- Closed: ${closedTime}
- Creator: ${election.creator.full_name}
${election.approver ? `- Approved by: ${election.approver.full_name}` : ""}

${
  election.description
    ? `Election Description:\n${election.description}\n\n`
    : ""
}

Voting Statistics:
- Eligible Voters: ${stats.total_eligible}
- Votes Cast: ${stats.total_voted}
- Voter Turnout: ${stats.turnout_percentage}%
- Total Votes Recorded: ${stats.total_votes}

Next Steps:
- Verify voting results in the admin dashboard
- Review audit logs for any irregularities
- Prepare results announcement if applicable
- Archive election data as per policy

View Election Results: ${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/admin/elections/${election.id}

---
University E-Voting System | Secure • Anonymous • Verified
    `;

    return { html, text };
  }

  /**
   * Log closure notifications in audit trail
   */
  private async logClosureNotifications(electionId: string, results: any) {
    try {
      await prisma.auditTrail.create({
        data: {
          user_id: "System Admin", // System action
          election_id: electionId,
          action: "CLOSURE_NOTIFICATIONS_SENT",
          metadata: {
            notifications_sent: results.successful.length,
            notifications_failed: results.failed.length,
            recipients: results.successful.map((r: any) => ({
              name: r.name,
              email: r.email,
              role: r.role,
            })),
            sent_at: new Date().toISOString(),
          },
        },
      });

      console.log(`✅ Logged closure notifications for election ${electionId}`);
    } catch (error) {
      console.error(`❌ Failed to log closure notifications:`, error);
    }
  }
}

export const electionNotificationService = new ElectionNotificationService();
