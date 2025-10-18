import nodemailer from "nodemailer";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const emailConfig: EmailConfig = {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  private getBaseTemplate(
    title: string,
    bodyContent: string,
    ctaLabel?: string,
    ctaLink?: string,
    note?: string
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${title}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #1f2937; 
            background-color: #f9fafb;
            margin: 0;
            padding: 20px 0;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            overflow: hidden;
          }
          .header { 
            background: #1f2937; 
            color: #ffffff; 
            padding: 32px 40px 24px;
            text-align: center;
          }
          .header h1 { 
            font-size: 24px; 
            font-weight: 600; 
            margin: 0;
            letter-spacing: -0.025em;
          }
          .content { 
            padding: 32px 40px;
          }
          .content h2 { 
            font-size: 20px; 
            font-weight: 600; 
            color: #111827; 
            margin-bottom: 16px;
          }
          .content p { 
            font-size: 16px; 
            color: #4b5563; 
            margin-bottom: 16px;
            line-height: 1.5;
          }
          .content p:last-child { margin-bottom: 0; }
          .cta-container { 
            text-align: center; 
            margin: 32px 0 24px;
          }
          .cta { 
            display: inline-block; 
            background: #2563eb; 
            color: #ffffff; 
            text-decoration: none; 
            padding: 12px 24px; 
            border-radius: 6px; 
            font-weight: 500;
            font-size: 16px;
            transition: background-color 0.2s;
          }
          .cta:hover { background: #1d4ed8; }
          .link-box { 
            background: #f3f4f6; 
            border: 1px solid #e5e7eb;
            border-radius: 6px; 
            padding: 16px; 
            margin-top: 16px;
            word-break: break-all;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            color: #6b7280;
          }
          .note { 
            background: #fef3c7; 
            border-left: 4px solid #f59e0b;
            padding: 16px; 
            margin: 24px 0;
            font-size: 14px; 
            color: #92400e;
            border-radius: 0 6px 6px 0;
          }
          .footer { 
            background: #f9fafb; 
            padding: 24px 40px; 
            text-align: center; 
            border-top: 1px solid #e5e7eb;
          }
          .footer p { 
            font-size: 14px; 
            color: #6b7280; 
            margin: 0;
          }
          .divider { 
            height: 1px; 
            background: #e5e7eb; 
            margin: 24px 0;
          }
          .badge {
            display: inline-block;
            background: #dbeafe;
            color: #1e40af;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 500;
            margin: 0 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VoteUPSA</h1>
          </div>
          <div class="content">
            <h2>${title}</h2>
            ${bodyContent}
            ${
              ctaLabel && ctaLink
                ? `<div class="cta-container">
                     <a href="${ctaLink}" class="cta">${ctaLabel}</a>
                   </div>
                   <div class="link-box">${ctaLink}</div>`
                : ""
            }
            ${note ? `<div class="note">${note}</div>` : ""}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} VoteUPSA - University of Professional Studies, Accra</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendEmail({
    to,
    subject,
    html,
    text,
  }: SendEmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || "VoteUPSA",
          address: process.env.FROM_EMAIL || process.env.SMTP_USER || "",
        },
        to,
        subject,
        html,
        text,
      };
      const result = await this.transporter.sendMail(mailOptions);
      console.log("Email sent:", result.messageId);
    } catch (error) {
      console.error("Email error:", error);
      throw new Error("Failed to send email");
    }
  }

  async sendInvitationEmail(
    email: string,
    invitationLink: string,
    role: string,
    inviterName?: string
  ): Promise<void> {
    const subject = `Invitation to Join VoteUPSA as ${role}`;
    const body = `
      <p>Hello,</p>
      <p>You have been invited to join <strong>VoteUPSA</strong> as a <strong><span class="badge">${role}</span></strong>.
      ${
        inviterName
          ? ` This invitation was sent by <strong>${inviterName}</strong>.`
          : ""
      }</p>
      <p>VoteUPSA is the official electronic voting system for the University of Professional Studies, Accra. As a ${role.toLowerCase()}, you will have access to manage and oversee election processes.</p>
      <p>Please click the button below to accept your invitation and set up your account:</p>
    `;
    const html = this.getBaseTemplate(
      `Welcome to VoteUPSA`,
      body,
      "Accept Invitation & Set Password",
      invitationLink,
      "This invitation link is unique to you and will expire in 7 days. Please do not share it with others."
    );
    const text = `
VoteUPSA - ${role} Invitation

You have been invited to join VoteUPSA as a ${role}.
${inviterName ? `Invited by: ${inviterName}` : ""}

Accept your invitation: ${invitationLink}
Link expires in 7 days.
    `.trim();
    await this.sendEmail({ to: email, subject, html, text });
  }

  async sendPasswordResetEmail(
    email: string,
    resetLink: string,
    userName?: string
  ): Promise<void> {
    const subject = "Password Reset Request - VoteUPSA";
    const body = `
      <p>Hello${userName ? " " + userName : ""},</p>
      <p>We received a request to reset your VoteUPSA password. If you didn’t make this request, you can safely ignore this email.</p>
      <p>Click the button below to reset your password:</p>
    `;
    const html = this.getBaseTemplate(
      "Password Reset",
      body,
      "Reset Your Password",
      resetLink,
      "This link will expire in 1 hour. Do not share it with others."
    );
    const text = `
Password Reset Request - VoteUPSA

Hello${userName ? " " + userName : ""},

To reset your password, visit:
${resetLink}

This link will expire in 1 hour. If you did not request this, please ignore this email.
    `.trim();
    await this.sendEmail({ to: email, subject, html, text });
  }

  async sendElectionSubmissionNotification(
    approverEmail: string,
    approverName: string,
    electionData: {
      title: string;
      department: string;
      createdBy: string;
      submittedAt: string;
    },
    reviewLink: string
  ): Promise<void> {
    const subject = "New Election Awaiting Your Approval - VoteUPSA";
    const body = `
      <p>Hello <strong>${approverName}</strong>,</p>
      <p>A new election has been submitted for your approval and requires your review.</p>
      
      <div class="divider"></div>
      
      <p><strong>Election Details:</strong></p>
      <p><strong>Title:</strong> ${electionData.title}</p>
      <p><strong>Department:</strong> <span class="badge">${
        electionData.department
      }</span></p>
      <p><strong>Submitted by:</strong> ${electionData.createdBy}</p>
      <p><strong>Submitted on:</strong> ${new Date(
        electionData.submittedAt
      ).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}</p>
      
      <div class="divider"></div>
      
      <p>Please review the election details and take appropriate action (approve, reject, or request review).</p>
    `;
    const html = this.getBaseTemplate(
      "Election Approval Required",
      body,
      "Review Election",
      reviewLink,
      "This election is currently pending your approval. Please review it as soon as possible."
    );
    const text = `
New Election Awaiting Your Approval - VoteUPSA

Hello ${approverName},

A new election has been submitted for your approval:

Election: ${electionData.title}
Department: ${electionData.department}
Submitted by: ${electionData.createdBy}
Submitted: ${new Date(electionData.submittedAt).toLocaleDateString()}

Review the election: ${reviewLink}
    `.trim();
    await this.sendEmail({ to: approverEmail, subject, html, text });
  }

  async sendApprovalActionNotification(
    recipientEmail: string,
    recipientName: string,
    actionData: {
      action: "approve" | "reject" | "request_review";
      electionTitle: string;
      department: string;
      approverName: string;
      actionDate: string;
      comments?: string;
    },
    dashboardLink: string
  ): Promise<void> {
    const actionMap = {
      approve: {
        status: "Approved",
        color: "#059669",
        message: "Your election has been approved and is now ready to proceed.",
      },
      reject: {
        status: "Rejected",
        color: "#dc2626",
        message:
          "Your election has been rejected and sent back to draft status.",
      },
      request_review: {
        status: "Review Requested",
        color: "#d97706",
        message: "Additional review has been requested for your election.",
      },
    };

    const actionInfo = actionMap[actionData.action];
    const subject = `Election ${actionInfo.status} - ${actionData.electionTitle}`;

    const body = `
      <p>Hello <strong>${recipientName}</strong>,</p>
      <p>An approver has taken action on your election submission.</p>
      
      <div class="divider"></div>
      
      <p><strong>Election Details:</strong></p>
      <p><strong>Title:</strong> ${actionData.electionTitle}</p>
      <p><strong>Department:</strong> <span class="badge">${
        actionData.department
      }</span></p>
      <p><strong>Status:</strong> <span style="color: ${
        actionInfo.color
      }; font-weight: 600;">${actionInfo.status}</span></p>
      <p><strong>Reviewed by:</strong> ${actionData.approverName}</p>
      <p><strong>Action taken:</strong> ${new Date(
        actionData.actionDate
      ).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}</p>
      
      ${
        actionData.comments
          ? `
        <div class="divider"></div>
        <p><strong>Approver Comments:</strong></p>
        <div style="background: #f8fafc; border-left: 4px solid #e2e8f0; padding: 16px; margin: 16px 0; border-radius: 0 6px 6px 0;">
          <p style="margin: 0; font-style: italic; color: #475569;">"${actionData.comments}"</p>
        </div>
      `
          : ""
      }
      
      <div class="divider"></div>
      
      <p>${actionInfo.message}</p>
      ${
        actionData.action === "reject"
          ? "<p>You can make the necessary changes and resubmit your election for approval.</p>"
          : actionData.action === "request_review"
          ? "<p>Please review the comments and make any necessary adjustments before resubmission.</p>"
          : "<p>You can now proceed with your election setup and configuration.</p>"
      }
    `;

    const html = this.getBaseTemplate(
      `Election ${actionInfo.status}`,
      body,
      "View Dashboard",
      dashboardLink,
      actionData.action === "reject"
        ? "You can edit and resubmit your election from the dashboard."
        : undefined
    );

    const text = `
Election ${actionInfo.status} - VoteUPSA

Hello ${recipientName},

Your election "${
      actionData.electionTitle
    }" has been ${actionInfo.status.toLowerCase()}.

Reviewed by: ${actionData.approverName}
Action taken: ${new Date(actionData.actionDate).toLocaleDateString()}
${actionData.comments ? `\nComments: ${actionData.comments}` : ""}

${actionInfo.message}

View your dashboard: ${dashboardLink}
    `.trim();

    await this.sendEmail({ to: recipientEmail, subject, html, text });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log("Email service ready");
      return true;
    } catch (error) {
      console.error("Email service failed:", error);
      return false;
    }
  }
}

export const emailService = new EmailService();
export default EmailService;
