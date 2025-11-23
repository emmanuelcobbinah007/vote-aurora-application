# Brevo Email Configuration Guide

## 1. Sign Up for Brevo
1. Visit https://www.brevo.com/
2. Create a free account (300 emails/day)
3. Verify your email address

## 2. Get Your API Key
1. Go to: Settings → SMTP & API → API Keys
2. Click "Generate a new API key"
3. Copy the API key (you'll only see it once!)

## 3. Configure Environment Variables

Add these to your `.env` file:

```env
# Brevo API Configuration
BREVO_API_KEY=your-brevo-api-key-here

# Email Sender Info
FROM_NAME=VoteAurora
FROM_EMAIL=noreply@yourdomain.com
```

## 4. Configure Webhook (After Deployment)

1. Deploy your application first
2. In Brevo dashboard:
   - Go to: Settings → Webhooks
   - Click "Add a new webhook"
   - **URL**: `https://yourdomain.com/api/webhooks/brevo`
   - **Events to subscribe**:
     - ✅ delivered
     - ✅ hard_bounce
     - ✅ soft_bounce
     - ✅ invalid_email
     - ✅ blocked
     - ✅ spam
   - Click "Add"

3. Test webhook:
   ```bash
   curl https://yourdomain.com/api/webhooks/brevo
   # Should return: {"message":"Brevo webhook endpoint is active", ...}
   ```

## 5. Verify Email Domain (Recommended)

For better deliverability:
1. Go to: Settings → Senders & IP
2. Add your domain
3. Add DNS records (SPF, DKIM) to your domain

## Pricing

- **Free Tier**: 300 emails/day
- **Lite Plan**: $25/month - Unlimited emails
- **Premium Plan**: $65/month - Advanced features

For elections with 3,000+ voters, upgrade to Lite plan.
