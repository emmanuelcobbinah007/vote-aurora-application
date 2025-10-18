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

  getSimpleTemplate(
    title: string,
    bodyContent: string,
    actionText?: string,
    actionUrl?: string
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 500px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: #2563eb;
            color: white;
            padding: 24px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            padding: 30px;
          }
          .content h2 {
            margin: 0 0 16px 0;
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
          }
          .content p {
            margin: 0 0 16px 0;
            color: #4b5563;
          }
          .content p:last-child { margin-bottom: 0; }
          .cta-container { 
            text-align: center; 
            margin: 32px 0;
          }
          .cta { 
            display: inline-block; 
            background: #2563eb; 
            color: #ffffff; 
            text-decoration: none; 
            padding: 14px 28px; 
            border: none;
            font-weight: 600;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .cta:hover { background: #1d4ed8; }
          .link-box { 
            background: #f8f9fa; 
            border: 1px solid #e5e7eb;
            padding: 16px; 
            margin-top: 16px;
            word-break: break-all;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 13px;
            color: #6b7280;
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
            margin-bottom: 8px;
          }
          .info-box p, .info-box ul {
            font-size: 14px;
            color: #4b5563;
            margin: 0;
          }
          .info-box ul {
            padding-left: 20px;
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
            margin-bottom: 8px;
          }
          .warning-box p, .warning-box ul {
            font-size: 14px;
            color: #92400e;
            margin: 0;
          }
          .warning-box ul {
            padding-left: 20px;
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
              actionText && actionUrl
                ? `<div class="cta-container">
                     <a href="${actionUrl}" class="cta">${actionText}</a>
                   </div>
                   <div class="link-box">${actionUrl}</div>`
                : ""
            }
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} VoteUPSA - University of Professional Studies, Accra</p>
            <p>Secure • Anonymous • Verified</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getBaseTemplate(
    title: string,
    bodyContent: string,
    actionText?: string,
    actionUrl?: string,
    note?: string
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: #2563eb;
            color: white;
            padding: 24px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .subtitle {
            font-size: 14px;
            opacity: 0.9;
            margin-top: 4px;
          }
          .content {
            padding: 30px;
          }
          .content h2 {
            margin: 0 0 16px 0;
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
          }
          .content p {
            margin: 0 0 16px 0;
            color: #4b5563;
          }
          .content p:last-child { margin-bottom: 0; }
          .cta-container {
            text-align: center;
            margin: 32px 0;
          }
          .cta {
            display: inline-block;
            background: #2563eb;
            color: #ffffff;
            text-decoration: none;
            padding: 14px 28px;
            border: none;
            font-weight: 600;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .cta:hover { background: #1d4ed8; }
          .link-box {
            background: #f8f9fa;
            border: 1px solid #e5e7eb;
            padding: 16px;
            margin-top: 16px;
            word-break: break-all;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 13px;
            color: #6b7280;
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
            margin-bottom: 8px;
          }
          .info-box p, .info-box ul {
            font-size: 14px;
            color: #4b5563;
            margin: 0;
          }
          .info-box ul {
            padding-left: 20px;
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
            margin-bottom: 8px;
          }
          .warning-box p, .warning-box ul {
            font-size: 14px;
            color: #92400e;
            margin: 0;
          }
          .warning-box ul {
            padding-left: 20px;
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
          .divider {
            height: 1px;
            background: #e5e7eb;
            margin: 24px 0;
          }
          .badge {
            display: inline-block;
            background: #eff6ff;
            color: #2563eb;
            padding: 4px 12px;
            border: 1px solid #dbeafe;
            font-size: 13px;
            font-weight: 500;
            margin: 0 4px;
          }
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .data-table th, .data-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          .data-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #374151;
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
            <h2>${title}</h2>
            ${bodyContent}
            ${
              actionText && actionUrl
                ? `<div class="cta-container">
                     <a href="${actionUrl}" class="cta">${actionText}</a>
                   </div>
                   <div class="link-box">${actionUrl}</div>`
                : ""
            }
            ${note ? `<div class="warning-box"><p>${note}</p></div>` : ""}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} VoteUPSA - University of Professional Studies, Accra</p>
            <p>Secure • Anonymous • Verified</p>
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
  }: SendEmailOptions): Promise<{ messageId: string }> {
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
      return { messageId: result.messageId };
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
      
      <div class="info-box">
        <h3>About VoteUPSA</h3>
        <p>VoteUPSA is the official electronic voting system for the University of Professional Studies, Accra. As a ${role.toLowerCase()}, you will have access to manage and oversee election processes.</p>
      </div>
      
      <p>Please click the button below to accept your invitation and set up your account:</p>
    `;
    const html = this.getBaseTemplate(
      `Welcome to VoteUPSA`,
      body,
      "Accept Invitation",
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
      <p>We received a request to reset your VoteUPSA password. If you didn't make this request, you can safely ignore this email.</p>
      
      <div class="warning-box">
        <h3>Security Notice</h3>
        <p>For your security, this password reset link will expire in 1 hour. Do not share this link with others.</p>
      </div>
      
      <p>Click the button below to reset your password:</p>
    `;
    const html = this.getBaseTemplate(
      "Password Reset",
      body,
      "Reset Password",
      resetLink,
      "If you did not request this password reset, please contact support immediately."
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
      
      <div class="info-box">
        <h3>Election Details</h3>
        <table class="data-table">
          <tr>
            <td><strong>Title:</strong></td>
            <td>${electionData.title}</td>
          </tr>
          <tr>
            <td><strong>Department:</strong></td>
            <td><span class="badge">${electionData.department}</span></td>
          </tr>
          <tr>
            <td><strong>Submitted by:</strong></td>
            <td>${electionData.createdBy}</td>
          </tr>
          <tr>
            <td><strong>Submitted on:</strong></td>
            <td>${new Date(electionData.submittedAt).toLocaleDateString(
              "en-US",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            )}</td>
          </tr>
        </table>
      </div>
      
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
        message: "Your election has been approved and is now ready to proceed.",
      },
      reject: {
        status: "Rejected",
        message:
          "Your election has been rejected and sent back to draft status.",
      },
      request_review: {
        status: "Review Requested",
        message: "Additional review has been requested for your election.",
      },
    };

    const actionInfo = actionMap[actionData.action];
    const subject = `Election ${actionInfo.status} - ${actionData.electionTitle}`;

    const body = `
      <p>Hello <strong>${recipientName}</strong>,</p>
      <p>An approver has taken action on your election submission.</p>
      
      <div class="divider"></div>
      
      <div class="info-box">
        <h3>Election Details</h3>
        <table class="data-table">
          <tr>
            <td><strong>Title:</strong></td>
            <td>${actionData.electionTitle}</td>
          </tr>
          <tr>
            <td><strong>Department:</strong></td>
            <td><span class="badge">${actionData.department}</span></td>
          </tr>
          <tr>
            <td><strong>Status:</strong></td>
            <td><strong>${actionInfo.status}</strong></td>
          </tr>
          <tr>
            <td><strong>Reviewed by:</strong></td>
            <td>${actionData.approverName}</td>
          </tr>
          <tr>
            <td><strong>Action taken:</strong></td>
            <td>${new Date(actionData.actionDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</td>
          </tr>
        </table>
      </div>
      
      ${
        actionData.comments
          ? `
        <div class="warning-box">
          <h3>Approver Comments</h3>
          <p>${actionData.comments}</p>
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

  async sendAdminAssignmentNotification(
    adminEmail: string,
    adminName: string,
    electionData: {
      title: string;
      department: string;
      start_time: string;
      end_time: string;
    },
    assignedBy: string,
    dashboardLink: string
  ): Promise<void> {
    const subject = "Election Assignment - VoteUPSA";
    const body = `
      <p>Hello <strong>${adminName}</strong>,</p>
      <p>You have been assigned to manage an election.</p>

      <div class="info-box">
        <h3>Election Details</h3>
        <p><strong>Title:</strong> ${electionData.title}</p>
        <p><strong>Department:</strong> ${
          electionData.department || "General"
        }</p>
        <p><strong>Start Date:</strong> ${new Date(
          electionData.start_time
        ).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> ${new Date(
          electionData.end_time
        ).toLocaleDateString()}</p>
        <p><strong>Assigned by:</strong> ${assignedBy}</p>
      </div>

      <p>As an election administrator, you will be responsible for overseeing the voting process and managing election-related activities.</p>
    `;

    const html = this.getSimpleTemplate(
      "Election Assignment",
      body,
      "View Election",
      dashboardLink
    );

    const text = `
Election Assignment - VoteUPSA

Hello ${adminName},

You have been assigned to manage the election: ${electionData.title}

Election Details:
- Department: ${electionData.department || "General"}
- Start Date: ${new Date(electionData.start_time).toLocaleDateString()}
- End Date: ${new Date(electionData.end_time).toLocaleDateString()}
- Assigned by: ${assignedBy}

View election: ${dashboardLink}
    `.trim();

    await this.sendEmail({ to: adminEmail, subject, html, text });
  }

  async sendAdminUnassignmentNotification(
    adminEmail: string,
    adminName: string,
    electionTitle: string,
    unassignedBy: string
  ): Promise<void> {
    const subject = "Election Unassignment - VoteUPSA";
    const body = `
      <p>Hello <strong>${adminName}</strong>,</p>
      <p>You have been unassigned from managing the election "${electionTitle}".</p>

      <div class="info-box">
        <h3>Unassignment Details</h3>
        <p><strong>Election:</strong> ${electionTitle}</p>
        <p><strong>Unassigned by:</strong> ${unassignedBy}</p>
      </div>

      <p>If you believe this was done in error, please contact your system administrator.</p>
    `;

    const html = this.getSimpleTemplate("Election Unassignment", body);

    const text = `
Election Unassignment - VoteUPSA

Hello ${adminName},

You have been unassigned from managing the election: ${electionTitle}

Unassigned by: ${unassignedBy}

If you believe this was done in error, please contact your system administrator.
    `.trim();

    await this.sendEmail({ to: adminEmail, subject, html, text });
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
