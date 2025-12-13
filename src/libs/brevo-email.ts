import prisma from "./prisma";
import { AuditTrailService } from "./auditTrailService";

interface EmailDeliveryStatus {
  email: string;
  status: "sent" | "delivered" | "bounced" | "spam" | "error";
  messageId: string;
  timestamp: Date;
  error?: string;
}

interface BrevoSendResponse {
  messageId: string;
}

class BrevoEmailService {
  private apiKey: string;

  constructor() {
    // Configure API key from environment
    this.apiKey = process.env.BREVO_API_KEY || "";

    if (!this.apiKey) {
      console.warn("⚠️ BREVO_API_KEY not configured. Email sending will fail.");
    }
  }

  async sendEmail(params: {
    to: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
    tags?: string[];
  }): Promise<{ messageId: string }> {
    const emailData = {
      sender: {
        name: process.env.FROM_NAME || "VoteAurora",
        email: process.env.FROM_EMAIL || "noreply@yourdomain.com",
      },
      to: [{ email: params.to }],
      subject: params.subject,
      htmlContent: params.htmlContent,
      textContent: params.textContent || params.subject,
      tags: params.tags,
    };

    try {
      // Use fetch to call Brevo API directly
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Brevo API error: ${JSON.stringify(errorData)}`);
      }

      const data: BrevoSendResponse = await response.json();

      // Log to delivery tracking
      await this.logEmailSent({
        email: params.to,
        status: "sent",
        messageId: data.messageId,
        timestamp: new Date(),
      });

      console.log(`✅ Email sent to ${params.to}: ${data.messageId}`);
      return { messageId: data.messageId };
    } catch (error: any) {
      console.error("Brevo API Error:", error);

      // Log failure
      await this.logEmailSent({
        email: params.to,
        status: "error",
        messageId: "error",
        timestamp: new Date(),
        error: error?.message || String(error),
      });

      throw new Error(`Failed to send email: ${error?.message || error}`);
    }
  }

  private async logEmailSent(status: EmailDeliveryStatus) {
    try {
      // Log to audit trail for tracking
      await AuditTrailService.log({
        user_id: "system",
        action: "EMAIL_DELIVERY_STATUS",
        metadata: {
          email: status.email,
          status: status.status,
          messageId: status.messageId,
          timestamp: status.timestamp.toISOString(),
          error: status.error,
        },
      });
    } catch (error) {
      console.error("Failed to log email delivery status:", error);
      // Don't throw - logging failure shouldn't break email sending
    }
  }

  // For backward compatibility with existing EmailService
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
            border-radius: 6px;
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
            border-radius: 4px;
          }
          .info-box { 
            background: #f8f9fa;
            border-left: 3px solid #2563eb;
            padding: 20px; 
            margin: 24px 0;
            border-radius: 4px;
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
            border-radius: 4px;
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
            <h1>VoteAurora</h1>
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
            <p>&copy; ${new Date().getFullYear()} VoteAurora - University of Professional Studies, Accra</p>
            <p>Secure • Anonymous • Verified</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const brevoEmailService = new BrevoEmailService();
