// src/libs/voterEmailService.ts
import { emailService } from "@/libs/email";
import prisma from "@/libs/prisma";

interface VoterToken {
  id: string;
  voter_token: string;
  student_id: string;
  student_email: string;
  election_id: string;
  expires_at: Date;
}

interface Election {
  id: string;
  title: string;
  description: string;
  start_time: Date;
  end_time: Date;
  is_general: boolean;
  department: string | null;
}

export class VoterEmailService {
  /**
   * Send voting emails to all eligible voters for an election
   */
  async sendVotingEmails(electionId: string) {
    console.log(`Starting email dispatch for election: ${electionId}`);

    try {
      // Get election details
      const election = await this.getElectionDetails(electionId);

      // Get all voter tokens for this election
      const voterTokens = await this.getVoterTokens(electionId);

      console.log(`Found ${voterTokens.length} voters to notify`);

      // Send emails in batches to avoid overwhelming the email service
      const results = await this.sendEmailsBatch(election, voterTokens);

      // Update election to mark emails as sent
      await this.markEmailsAsSent(electionId, results);

      return {
        success: true,
        election_id: electionId,
        election_title: election.title,
        total_voters: voterTokens.length,
        emails_sent: results.successful.length,
        emails_failed: results.failed.length,
        batch_results: results,
      };
    } catch (error) {
      console.error(`Email dispatch failed for election ${electionId}:`, error);
      throw error;
    }
  }

  /**
   * Get election details
   */
  private async getElectionDetails(electionId: string): Promise<Election> {
    const election = await prisma.elections.findUnique({
      where: { id: electionId },
      select: {
        id: true,
        title: true,
        description: true,
        start_time: true,
        end_time: true,
        is_general: true,
        department: true,
      },
    });

    if (!election) {
      throw new Error(`Election ${electionId} not found`);
    }

    return {
      ...election,
      description: election.description ?? "",
    };
  }

  /**
   * Get voter tokens for an election
   */
  private async getVoterTokens(electionId: string): Promise<VoterToken[]> {
    return await prisma.voterTokens.findMany({
      where: {
        election_id: electionId,
        used: false, // Only send to unused tokens
      },
      select: {
        id: true,
        voter_token: true,
        student_id: true,
        student_email: true,
        election_id: true,
        expires_at: true,
      },
    });
  }

  /**
   * Send emails in batches
   */
  private async sendEmailsBatch(election: Election, voterTokens: VoterToken[]) {
    const BATCH_SIZE = 10; // Send 10 emails at a time
    const BATCH_DELAY = 2000; // 2 second delay between batches

    const results: {
      successful: {
        student_id: string;
        email: string;
        token_id: string;
        message_id?: string;
      }[];
      failed: {
        student_id: string;
        email: string;
        token_id: string;
        error: string;
      }[];
      total: number;
    } = {
      successful: [],
      failed: [],
      total: voterTokens.length,
    };

    // Process in batches
    for (let i = 0; i < voterTokens.length; i += BATCH_SIZE) {
      const batch = voterTokens.slice(i, i + BATCH_SIZE);

      console.log(
        `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
          voterTokens.length / BATCH_SIZE
        )} (${batch.length} emails)`
      );

      // Send all emails in current batch concurrently
      const batchPromises = batch.map((token) =>
        this.sendSingleVotingEmail(election, token)
      );

      try {
        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach((result, index) => {
          const token = batch[index];
          if (result.status === "fulfilled") {
            results.successful.push({
              student_id: token.student_id,
              email: token.student_email,
              token_id: token.id,
              message_id: result.value.messageId,
            });
            console.log(
              `Email sent to ${token.student_id}: ${token.student_email}`
            );
          } else {
            results.failed.push({
              student_id: token.student_id,
              email: token.student_email,
              token_id: token.id,
              error: result.reason.message,
            });
            console.error(
              `Failed to send email to ${token.student_id}:`,
              result.reason
            );
          }
        });

        // Delay between batches to be nice to email service
        if (i + BATCH_SIZE < voterTokens.length) {
          console.log(`⏳ Waiting ${BATCH_DELAY}ms before next batch...`);
          await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
        }
      } catch (error) {
        console.error(`❌ Batch processing failed:`, error);
        // Mark entire batch as failed
        batch.forEach((token) => {
          results.failed.push({
            student_id: token.student_id,
            email: token.student_email,
            token_id: token.id,
            error: error instanceof Error ? error.message : String(error),
          });
        });
      }
    }

    console.log(
      `📊 Email dispatch complete: ${results.successful.length} sent, ${results.failed.length} failed`
    );
    return results;
  }

  /**
   * Send a single voting email
   */
  private async sendSingleVotingEmail(election: Election, token: VoterToken) {
    const votingUrl = this.generateVotingUrl(token.voter_token);

    const emailContent = this.generateEmailContent(election, token, votingUrl);

    // Send the email and get the messageId
    const result = await emailService.sendEmail({
      to: token.student_email,
      subject: `Your Voting Link: ${election.title}`,
      html: emailContent.html,
      text: emailContent.text,
    });

    return { messageId: result.messageId };
  }

  /**
   * Generate secure voting URL
   */
  private generateVotingUrl(voterToken: string): string {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return `${baseUrl}/vote?token=${voterToken}`;
  }

  /**
   * Generate email content (HTML and text versions)
   */
  private generateEmailContent(
    election: Election,
    token: VoterToken,
    votingUrl: string
  ) {
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

    const expiresAt = token.expires_at.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const bodyContent = `
      <p>Hello <strong>${token.student_id}</strong>,</p>
      <p>You are eligible to vote in the <strong>${
        election.title
      }</strong>. Click the button below to cast your vote securely:</p>

      <div class="info-box">
        <h3>Election Details</h3>
        <p><strong>Election:</strong> ${election.title}</p>
        <p><strong>Type:</strong> ${
          election.is_general
            ? "General Election"
            : `Department Election (${election.department})`
        }</p>
        <p><strong>Voting Period:</strong> ${startTime} - ${endTime}</p>
        <p><strong>Your Student ID:</strong> ${token.student_id}</p>
        <p><strong>Expires:</strong> ${expiresAt}</p>
      </div>

      ${
        election.description
          ? `
      <div class="info-box">
        <h3>About This Election</h3>
        <p>${election.description}</p>
      </div>
      `
          : ""
      }

      <div class="warning-box">
        <h3>Important Security Information</h3>
        <ul>
          <li><strong>One-time use:</strong> This link can only be used once</li>
          <li><strong>Personal:</strong> Do not share this link with anyone</li>
          <li><strong>Secure:</strong> Your vote is anonymous and encrypted</li>
        </ul>
      </div>

      <p style="text-align: center; color: #6b7280;">Need help? Contact the election administrators.</p>
    `;

    const html = emailService.getSimpleTemplate(
      election.title,
      bodyContent,
      "Vote Now",
      votingUrl
    );

    const text = `
VoteUPSA - ${election.title}

Hello ${token.student_id}!

You are eligible to vote in the ${election.title}.

VOTE NOW: ${votingUrl}

Election Details:
- Election: ${election.title}
- Type: ${
      election.is_general
        ? "General Election"
        : `Department Election (${election.department})`
    }
- Voting Period: ${startTime} - ${endTime}
- Your Student ID: ${token.student_id}
- Expires: ${expiresAt}

${
  election.description
    ? `About This Election:\n${election.description}\n\n`
    : ""
}

Important Security Information:
- One-time use: This link can only be used once
- Personal: Do not share this link with anyone
- Secure: Your vote is anonymous and encrypted

Need help? Contact the election administrators.

---
VoteUPSA - University of Professional Studies, Accra
Secure • Anonymous • Verified
    `.trim();

    return { html, text };
  }

  /**
   * Mark emails as sent in database
   */
  private async markEmailsAsSent(electionId: string, results: any) {
    try {
      // Update election to mark emails as sent
      await prisma.elections.update({
        where: { id: electionId },
        data: {
          emails_sent: true,
          updated_at: new Date(),
        },
      });

      // Log in audit trail
      await prisma.auditTrail.create({
        data: {
          user_id: "system", // or provide the actual user ID if available
          election_id: electionId,
          action: "VOTING_EMAILS_SENT",
          metadata: {
            total_voters: results.total,
            emails_sent: results.successful.length,
            emails_failed: results.failed.length,
            dispatch_time: new Date().toISOString(),
          },
        },
      });

      console.log(`✅ Marked emails as sent for election ${electionId}`);
    } catch (error) {
      console.error(`❌ Failed to mark emails as sent:`, error);
    }
  }
}

export const voterEmailService = new VoterEmailService();
