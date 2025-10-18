import { emailService } from "@/libs/email";
import prisma from "@/libs/prisma";
import crypto from "crypto";

interface VerificationSession {
  token: string;
  student_id: string;
  student_email: string;
  election_id: string;
  otp: string;
  otp_expires_at: Date;
  attempts: number;
  verified: boolean;
}

export class VoterVerificationService {
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_OTP_ATTEMPTS = 3;
  private readonly MAX_OTP_REQUESTS = 5;
  private readonly ACCESS_TOKEN_EXPIRY_MINUTES = 60; // Extended to 1 hour
  private readonly RESEND_COOLDOWN_SECONDS = 60;

  /**
   * Step 1: Validate voting token and initiate verification
   */
  async initiateVerification(voterToken: string) {
    console.log(
      `🔍 Initiating verification for token: ${voterToken.substring(0, 8)}...`
    );

    try {
      // 1. Validate the voter token
      const tokenRecord = await this.validateVoterToken(voterToken);

      // 2. Check if election is still active
      await this.validateElectionStatus(tokenRecord.election_id);

      // 3. Generate and send OTP
      const otp = this.generateOTP();
      const otpExpiresAt = new Date(
        Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000
      );

      // 4. Update token record with OTP
      await this.updateTokenWithOTP(tokenRecord.id, otp, otpExpiresAt);

      // 5. Send OTP email
      await this.sendOTPEmail(tokenRecord, otp);

      // 6. Log verification initiation
      await this.logVerificationActivity(
        tokenRecord.election_id,
        tokenRecord.student_id,
        "OTP_SENT"
      );

      return {
        success: true,
        message: "Verification code sent to your university email",
        data: {
          student_id: tokenRecord.student_id,
          email_masked: this.maskEmail(tokenRecord.student_email),
          election_id: tokenRecord.election_id,
          expires_in_minutes: this.OTP_EXPIRY_MINUTES,
          max_attempts: this.MAX_OTP_ATTEMPTS,
        },
      };
    } catch (error) {
      console.error(`❌ Verification initiation failed:`, error);
      throw error;
    }
  }

  /**
   * Step 2: Verify student ID and OTP
   */
  async verifyCredentials(voterToken: string, studentId: string, otp: string) {
    console.log(`Verifying credentials for student: ${studentId}`);

    try {
      // 1. Get token record with current OTP
      const tokenRecord = await this.getTokenRecordForVerification(voterToken);

      // 2. Validate student ID matches
      if (tokenRecord.student_id !== studentId.toUpperCase().trim()) {
        await this.incrementVerificationAttempts(tokenRecord.id);
        throw new Error("Invalid student ID");
      }

      // 3. Validate OTP
      await this.validateOTP(tokenRecord, otp);

      // 4. Mark token as verified and generate access token
      const accessToken = await this.generateAccessToken(tokenRecord);

      // 5. Log successful verification
      await this.logVerificationActivity(
        tokenRecord.election_id,
        tokenRecord.student_id,
        "VERIFICATION_SUCCESS"
      );

      return {
        success: true,
        message: "Verification successful! Redirecting to ballot...",
        data: {
          access_token: accessToken,
          student_id: tokenRecord.student_id,
          election_id: tokenRecord.election_id,
          expires_at: new Date(
            Date.now() + this.ACCESS_TOKEN_EXPIRY_MINUTES * 60 * 1000
          ),
        },
      };
    } catch (error) {
      console.error(
        `❌ Credential verification failed for ${studentId}:`,
        error
      );

      // Log failed attempt if we have the token record
      try {
        const tokenRecord = await prisma.voterTokens.findFirst({
          where: { voter_token: voterToken },
        });
        if (tokenRecord) {
          await this.logVerificationActivity(
            tokenRecord.election_id,
            studentId,
            "VERIFICATION_FAILED",
            { error: error instanceof Error ? error.message : String(error) }
          );
        }
      } catch (logError) {
        console.error("Failed to log verification attempt:", logError);
      }

      throw error;
    }
  }

  /**
   * Step 3: Resend OTP (with rate limiting)
   */
  async resendOTP(voterToken: string) {
    console.log(`📧 Resending OTP for token: ${voterToken.substring(0, 8)}...`);

    try {
      // 1. Get token record
      const tokenRecord = await this.validateVoterToken(voterToken);

      // 2. Check rate limiting
      await this.checkOTPResendLimit(tokenRecord);

      // 3. Generate new OTP
      const otp = this.generateOTP();
      const otpExpiresAt = new Date(
        Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000
      );

      // 4. Update token with new OTP and reset attempts
      await prisma.voterTokens.update({
        where: { id: tokenRecord.id },
        data: {
          verification_otp: otp,
          otp_expires_at: otpExpiresAt,
          otp_attempts: 0, // Reset attempts
          otp_resend_count: { increment: 1 },
          updated_at: new Date(),
        },
      });

      // 5. Send new OTP email
      await this.sendOTPEmail(tokenRecord, otp);

      // 6. Log resend activity
      await this.logVerificationActivity(
        tokenRecord.election_id,
        tokenRecord.student_id,
        "OTP_RESENT"
      );

      return {
        success: true,
        message: "New verification code sent to your email",
        data: {
          expires_in_minutes: this.OTP_EXPIRY_MINUTES,
        },
      };
    } catch (error) {
      console.error(`❌ OTP resend failed:`, error);
      throw error;
    }
  }

  /**
   * Validate voter token
   */
  private async validateVoterToken(voterToken: string) {
    const tokenRecord = await prisma.voterTokens.findFirst({
      where: {
        voter_token: voterToken,
        used: false,
      },
      include: {
        election: {
          select: {
            id: true,
            title: true,
            status: true,
            end_time: true,
          },
        },
      },
    });

    if (!tokenRecord) {
      throw new Error("Invalid or expired voting link");
    }

    // Check if token has expired
    if (tokenRecord.expires_at && new Date() > tokenRecord.expires_at) {
      throw new Error("Voting link has expired");
    }

    return tokenRecord;
  }

  /**
   * Validate election is still active
   */
  private async validateElectionStatus(electionId: string) {
    const election = await prisma.elections.findUnique({
      where: { id: electionId },
      select: {
        status: true,
        end_time: true,
      },
    });

    if (!election || election.status !== "LIVE") {
      throw new Error("Election is not currently active");
    }

    if (new Date() > election.end_time) {
      throw new Error("Voting period has ended");
    }
  }

  /**
   * Generate secure OTP
   */
  private generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Update token record with OTP
   */
  private async updateTokenWithOTP(
    tokenId: string,
    otp: string,
    expiresAt: Date
  ) {
    await prisma.voterTokens.update({
      where: { id: tokenId },
      data: {
        verification_otp: otp,
        otp_expires_at: expiresAt,
        otp_attempts: 0,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Send OTP email to student
   */
  private async sendOTPEmail(tokenRecord: any, otp: string) {
    const emailContent = this.generateOTPEmailContent(tokenRecord, otp);

    await emailService.sendEmail({
      to: tokenRecord.student_email,
      subject: `Your Voting Verification Code: ${otp}`,
      html: emailContent.html,
      text: emailContent.text,
    });

    console.log(
      `📧 OTP sent to ${tokenRecord.student_id}: ${tokenRecord.student_email}`
    );
  }

  /**
   * Generate OTP email content - clean design matching new template
   */
  private generateOTPEmailContent(tokenRecord: any, otp: string) {
    const expiryTime = new Date(
      Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000
    ).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Voting Verification Code</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          line-height: 1.6; 
          color: #374151; 
          background-color: #f8f9fa;
          margin: 0;
          padding: 20px 0;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: #ffffff;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }
        .header { 
          background: #ffffff; 
          color: #1f2937; 
          padding: 32px 40px;
          text-align: center;
          border-bottom: 2px solid #2563eb;
        }
        .header h1 { 
          font-size: 28px; 
          font-weight: 700; 
          margin: 0;
          color: #1f2937;
        }
        .header .subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-top: 4px;
        }
        .content { 
          padding: 40px;
        }
        .content h2 { 
          font-size: 22px; 
          font-weight: 600; 
          color: #1f2937; 
          margin-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 8px;
        }
        .content p { 
          font-size: 16px; 
          color: #4b5563; 
          margin-bottom: 16px;
          line-height: 1.6;
        }
        .otp-display {
          text-align: center;
          margin: 32px 0;
          padding: 32px;
          background: #f8f9fa;
          border: 2px solid #cc910d;
          border-radius: 8px;
        }
        .otp-label {
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }
        .otp-code {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 32px;
          font-weight: 700;
          color: #cc910d;
          letter-spacing: 4px;
        }
        .info-box { 
          background: #f8f9fa;
          border-left: 3px solid #2563eb;
          padding: 20px; 
          margin: 24px 0;
        }
        .info-box h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 12px;
        }
        .info-box ol {
          font-size: 14px;
          color: #4b5563;
          margin: 0;
          padding-left: 20px;
        }
        .info-box ol li {
          margin-bottom: 8px;
        }
        .warning-box { 
          background: #fefce8;
          border-left: 3px solid #cc910d;
          padding: 20px; 
          margin: 24px 0;
        }
        .warning-box h3 {
          font-size: 16px;
          font-weight: 600;
          color: #92400e;
          margin-bottom: 12px;
        }
        .warning-box ul {
          font-size: 14px;
          color: #92400e;
          margin: 0;
          padding-left: 20px;
        }
        .warning-box ul li {
          margin-bottom: 8px;
        }
        .footer { 
          background: #f8f9fa; 
          padding: 24px 40px; 
          text-align: center; 
          border-top: 1px solid #e5e7eb;
        }
        .footer p { 
          font-size: 14px; 
          color: #6b7280; 
          margin: 0;
        }
        .code-inline {
          background: #e5e7eb;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 13px;
          color: #374151;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }
        .data-table td {
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        .data-table td:first-child {
          font-weight: 600;
          color: #374151;
          width: 30%;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>VoteUPSA</h1>
          <div class="subtitle">University of Professional Studies, Accra</div>
        </div>
        <div class="content">
          <h2>Verification Required</h2>
          
          <p>Hello <strong>${tokenRecord.student_id}</strong>,</p>
          <p>To complete your voting verification and access your ballot for <strong>${
            tokenRecord.election.title
          }</strong>, please use the verification code below:</p>

          <div class="otp-display">
            <div class="otp-label">Your Verification Code</div>
            <div class="otp-code">${otp}</div>
          </div>

          <div class="info-box">
            <h3>How to Complete Verification</h3>
            <ol>
              <li><strong>Return to the voting page</strong> in your browser</li>
              <li><strong>Enter your Student ID:</strong> <span class="code-inline">${
                tokenRecord.student_id
              }</span></li>
              <li><strong>Enter the verification code:</strong> <span class="code-inline">${otp}</span></li>
              <li><strong>Click "Verify & Continue"</strong> to access your ballot</li>
            </ol>
          </div>

          <div class="warning-box">
            <h3>Security Information</h3>
            <table class="data-table">
              <tr>
                <td>Expires:</td>
                <td>This code expires at ${expiryTime} (${
      this.OTP_EXPIRY_MINUTES
    } minutes)</td>
              </tr>
              <tr>
                <td>One-time use:</td>
                <td>Code becomes invalid after verification</td>
              </tr>
              <tr>
                <td>Keep private:</td>
                <td>Do not share this code with anyone</td>
              </tr>
              <tr>
                <td>Attempts:</td>
                <td>You have ${
                  this.MAX_OTP_ATTEMPTS
                } attempts to enter the code</td>
              </tr>
            </table>
          </div>

          <div class="warning-box">
            <h3>Important Notice</h3>
            <p><strong>Didn't request this code?</strong> Contact the election administrators immediately.</p>
          </div>

          <p style="text-align: center; color: #6b7280; margin-top: 32px;">Ready to vote? Return to your browser to continue.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} VoteUPSA - University of Professional Studies, Accra</p>
          <p>Secure • Anonymous • Verified</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const text = `
VoteUPSA - Voting Verification Required
${tokenRecord.election.title}

Hello ${tokenRecord.student_id}! 

To complete your voting verification and access your ballot, please use this verification code:

===============================
    VERIFICATION CODE: ${otp}
===============================

HOW TO COMPLETE VERIFICATION:
1. Return to the voting page in your browser
2. Enter your Student ID: ${tokenRecord.student_id}
3. Enter the verification code: ${otp}
4. Click "Verify & Continue" to access your ballot

SECURITY INFORMATION:
Expires: This code expires at ${expiryTime} (${this.OTP_EXPIRY_MINUTES} minutes)
One-time use: Code becomes invalid after verification
Keep private: Do not share this code with anyone
Attempts: You have ${this.MAX_OTP_ATTEMPTS} attempts to enter the code

IMPORTANT NOTICE:
Didn't request this code? Contact the election administrators immediately.

Ready to Vote? Return to Your Browser

---
VoteUPSA - University Electronic Voting System
Secure • Anonymous • Verified

© ${new Date().getFullYear()} VoteUPSA. Ensuring democratic participation through secure technology.
    `;

    return { html, text };
  }

  /**
   * Get token record for verification
   */
  private async getTokenRecordForVerification(voterToken: string) {
    const tokenRecord = await prisma.voterTokens.findFirst({
      where: {
        voter_token: voterToken,
        used: false,
      },
    });

    if (!tokenRecord) {
      throw new Error("Invalid voting session");
    }

    return tokenRecord;
  }

  /**
   * Validate OTP with attempt limiting
   */
  private async validateOTP(tokenRecord: any, providedOTP: string) {
    // Check if OTP has expired
    if (
      !tokenRecord.otp_expires_at ||
      new Date() > tokenRecord.otp_expires_at
    ) {
      throw new Error(
        "Verification code has expired. Please request a new one."
      );
    }

    // Check if too many attempts
    if (tokenRecord.otp_attempts >= this.MAX_OTP_ATTEMPTS) {
      throw new Error(
        "Too many failed attempts. Please request a new verification code."
      );
    }

    // Validate OTP
    if (tokenRecord.verification_otp !== providedOTP.trim()) {
      await this.incrementVerificationAttempts(tokenRecord.id);

      const remainingAttempts =
        this.MAX_OTP_ATTEMPTS - (tokenRecord.otp_attempts + 1);
      throw new Error(
        `Invalid verification code. ${remainingAttempts} attempts remaining.`
      );
    }
  }

  /**
   * Increment verification attempts
   */
  private async incrementVerificationAttempts(tokenId: string) {
    await prisma.voterTokens.update({
      where: { id: tokenId },
      data: {
        otp_attempts: { increment: 1 },
        updated_at: new Date(),
      },
    });
  }

  /**
   * Generate access token for verified voter
   */
  private async generateAccessToken(tokenRecord: any) {
    const accessToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(
      Date.now() + this.ACCESS_TOKEN_EXPIRY_MINUTES * 60 * 1000
    );

    await prisma.voterTokens.update({
      where: { id: tokenRecord.id },
      data: {
        access_token: accessToken,
        access_token_expires_at: expiresAt,
        verified_at: new Date(),
        updated_at: new Date(),
      },
    });

    return accessToken;
  }

  /**
   * Check OTP resend rate limiting
   */
  private async checkOTPResendLimit(tokenRecord: any) {
    const resendCount = tokenRecord.otp_resend_count || 0;

    if (resendCount >= this.MAX_OTP_REQUESTS) {
      throw new Error("Maximum OTP requests exceeded. Please contact support.");
    }

    // Check if last resend was too recent (cooldown period)
    if (tokenRecord.updated_at) {
      const timeSinceLastResend =
        Date.now() - new Date(tokenRecord.updated_at).getTime();
      const cooldownMs = this.RESEND_COOLDOWN_SECONDS * 1000;

      if (timeSinceLastResend < cooldownMs) {
        const remainingSeconds = Math.ceil(
          (cooldownMs - timeSinceLastResend) / 1000
        );
        throw new Error(
          `Please wait ${remainingSeconds} seconds before requesting a new code.`
        );
      }
    }
  }

  /**
   * Mask email for privacy
   */
  private maskEmail(email: string): string {
    const [localPart, domain] = email.split("@");
    const maskedLocal =
      localPart.length > 3
        ? `${localPart.substring(0, 2)}${"*".repeat(
            localPart.length - 4
          )}${localPart.slice(-2)}`
        : `${localPart[0]}${"*".repeat(localPart.length - 1)}`;

    return `${maskedLocal}@${domain}`;
  }

  /**
   * Log verification activities for audit
   */
  private async logVerificationActivity(
    electionId: string,
    studentId: string,
    action: string,
    metadata: any = {}
  ) {
    try {
      await prisma.auditTrail.create({
        data: {
          user_id: "System Admin", // Voter activity - no user account
          election_id: electionId,
          action: `VOTER_${action}`,
          metadata: {
            student_id: studentId,
            action_time: new Date().toISOString(),
            ...metadata,
          },
        },
      });
    } catch (error) {
      console.error("Failed to log verification activity:", error);
    }
  }

  /**
   * Validate access token (for ballot page)
   */
  async validateAccessToken(accessToken: string) {
    console.log(
      `🔍 Validating access token: ${accessToken.substring(0, 8)}...`
    );

    try {
      const voterRecord = await prisma.voterTokens.findFirst({
        where: {
          access_token: accessToken,
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
        throw new Error("Invalid access token or vote already submitted");
      }

      // Check if access token has expired
      if (
        voterRecord.access_token_expires_at &&
        new Date() > voterRecord.access_token_expires_at
      ) {
        throw new Error("Access token has expired. Please verify again.");
      }

      // Check if election is still active
      if (voterRecord.election.status !== "LIVE") {
        throw new Error("Election is no longer active");
      }

      // Check if voting period has ended
      if (new Date() > voterRecord.election.end_time) {
        throw new Error("Voting period has ended");
      }

      // Check if voter was verified
      if (!voterRecord.verified_at) {
        throw new Error("Voter verification incomplete");
      }

      console.log(
        `✅ Access token validated for student: ${voterRecord.student_id}`
      );

      return {
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
      };
    } catch (error) {
      console.error(`❌ Access token validation failed:`, error);
      throw error;
    }
  }
}

export const voterVerificationService = new VoterVerificationService();
