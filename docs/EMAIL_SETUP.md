# Email Configuration Setup

This document explains how to configure email functionality for the University E-Voting System.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_NAME="University E-Voting System"
FROM_EMAIL="your-email@gmail.com"
```

## Email Provider Setup

### Gmail Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:

   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this app password as `SMTP_PASS`

3. **Update Environment Variables**:
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_SECURE="false"
   SMTP_USER="youremail@gmail.com"
   SMTP_PASS="your-16-character-app-password"
   FROM_NAME="University E-Voting System"
   FROM_EMAIL="youremail@gmail.com"
   ```

### Other Email Providers

#### Outlook/Hotmail

```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_SECURE="false"
```

#### Yahoo Mail

```env
SMTP_HOST="smtp.mail.yahoo.com"
SMTP_PORT="587"
SMTP_SECURE="false"
```

#### Custom SMTP Server

```env
SMTP_HOST="your-smtp-server.com"
SMTP_PORT="587"
SMTP_SECURE="false"  # or "true" for port 465
```

## Testing Email Configuration

### Method 1: API Endpoint Test

1. **Test Connection**:

   ```bash
   GET http://localhost:3000/api/email/test
   ```

2. **Send Test Email**:

   ```bash
   POST http://localhost:3000/api/email/test
   Content-Type: application/json

   {
     "to": "test@example.com",
     "subject": "Test Email"
   }
   ```

### Method 2: Invitation Flow Test

1. Try sending an invitation through the UI
2. Check console logs for email sending status
3. Check recipient's email inbox

## Troubleshooting

### Common Issues

1. **"Authentication failed"**

   - Make sure you're using an app password (not your regular password) for Gmail
   - Verify 2FA is enabled on your account

2. **"Connection timeout"**

   - Check SMTP host and port settings
   - Verify firewall/network restrictions

3. **"Invalid login"**

   - Double-check SMTP_USER and SMTP_PASS
   - Ensure the email account exists and is accessible

4. **"Email not received"**
   - Check spam/junk folders
   - Verify the recipient email address
   - Check email service logs

### Gmail-Specific Issues

- **"Less secure app access"** is deprecated - use App Passwords
- Make sure 2-Factor Authentication is enabled
- App passwords are 16 characters without spaces

## Email Template Customization

The invitation email template can be customized in:
`src/libs/email.ts` → `sendInvitationEmail()` method

The template includes:

- Professional HTML styling
- Responsive design
- Security notices
- Clear call-to-action buttons
- Plain text fallback

## Security Considerations

1. **Never commit real credentials** to version control
2. **Use app passwords** instead of account passwords
3. **Set appropriate SMTP security settings**
4. **Validate recipient emails** before sending
5. **Rate limit email sending** in production
6. **Monitor email bounces and failures**

## Production Recommendations

1. **Use a dedicated email service** (SendGrid, AWS SES, Mailgun)
2. **Set up email monitoring and analytics**
3. **Implement email templates management**
4. **Add email queue for bulk sending**
5. **Configure proper SPF, DKIM, and DMARC records**
