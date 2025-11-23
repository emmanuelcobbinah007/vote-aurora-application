# Sentry Error Monitoring Setup Guide

## 1. Create Sentry Account
1. Visit https://sentry.io/signup/
2. Sign up for free account (50,000 events/month)
3. Create a new project:
   - Platform: **Next.js**
   - Project name: **VoteAurora**
   - Alert frequency: **On every new issue**

## 2. Get DSN (Data Source Name)
1. After creating project, copy your DSN
2. It looks like: `https://abc123@o123456.ingest.sentry.io/456789`

## 3. Configure Environment Variables

Add to your `.env.local` (for development):
```env
NEXT_PUBLIC_SENTRY_DSN=your-dsn-here
SENTRY_AUTH_TOKEN=your-auth-token-here
```

Add to production environment ( Vercel/deployment platform):
```env
NEXT_PUBLIC_SENTRY_DSN=your-dsn-here
SENTRY_AUTH_TOKEN=your-auth-token-here
```

## 4. Initialize Sentry (After env vars are set)

Run the Sentry wizard to auto-configure:
```bash
npx @sentry/wizard@latest -i nextjs
```

This will:
- Create `sentry.client.config.ts`
- Create `sentry.server.config.ts`
- Create `sentry.edge.config.ts`
- Update `next.config.js`
- Add source maps upload configuration

## 5. Manual Configuration (Alternative)

If you prefer manual setup:

**Create `sentry.client.config.ts`:**
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  
  beforeSend(event, hint) {
    // Remove sensitive data
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    
    // Remove tokens from URLs
    if (event.request?.url) {
      event.request.url = event.request.url.replace(
        /token=[^&]+/g,
        "token=[REDACTED]"
      );
    }
    
    return event;
  },
  
  ignoreErrors: [
    "Network request failed",
    "Failed to fetch",
    "Load failed",
  ],
});
```

**Create `sentry.server.config.ts`:**
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  
  beforeSend(event, hint) {
    // Remove database connection strings
    if (event.exception) {
      event.exception.values?.forEach((exception) => {
        if (exception.value) {
          exception.value = exception.value.replace(
            /postgresql:\/\/[^@]+@/g,
            "postgresql://[REDACTED]@"
          );
        }
      });
    }
    
    return event;
  },
});
```

## 6. Test Error Tracking

Create a test error to verify setup:

**Add to any page:**
```typescript
// Test error
if (process.env.NODE_ENV === 'development') {
  throw new Error('Test Sentry Error - DELETE THIS');
}
```

Visit the page and check Sentry dashboard for the error.

## 7. Enable Slow Query Tracking (Already Implemented)

The Prisma client in `src/libs/prisma.ts` already has slow query detection configured with a 1-second threshold.

To integrate with Sentry, update the slow query handler:

```typescript
import * as Sentry from "@sentry/nextjs";

prisma.$on("query" as never, (e: any) => {
  if (e.duration > SLOW_QUERY_THRESHOLD) {
    console.warn(`🐌 Slow Query Detected (${e.duration}ms)`);
    
    Sentry.captureMessage(`Slow Query: ${e.duration}ms`, {
      level: "warning",
      tags: { type: "slow_query" },
      extra: {
        duration: e.duration,
        query: e.query.substring(0, 500),
      },
    });
  }
});
```

## 8. Set Up Alerts

In Sentry dashboard:
1. Go to **Settings** → **Alerts**
2. Create alert rule:
   - **When**: An event is first seen
   - **Then**: Send notification to email
3. Create another rule:
   - **When**: Slow queries exceed threshold
   - **Then**: Send notification

## 9. Performance Monitoring

Enable performance monitoring in Sentry config:
```typescript
tracesSampleRate: 0.1, // Sample 10% of transactions
```

This tracks:
- API response times
- Database query times
- Page load times

## 10. Session Replay

Already enabled in config:
```typescript
replaysOnErrorSampleRate: 1.0, // Always replay when error occurs
replaysSessionSampleRate: 0.1, // 10% of normal sessions
```

This records user sessions with errors for debugging.

## Pricing

- **Free Tier**: 50,000 events/month
- **Team Plan**: $26/month - 500,000 events
- **Business Plan**: $80/month - 5,000,000 events

For a university voting system, the free tier should be sufficient.

## Benefits

✅ Track OTP failures
✅ Monitor vote submission errors  
✅ Alert on database crashes
✅ Detect slow queries (>1s)
✅ Session replay for debugging
✅ Performance monitoring
✅ Source maps for production debugging

## Security Notes

- Never log sensitive data (tokens, passwords, emails)
- `beforeSend` hooks filter out sensitive information
- Connection strings are redacted automatically
- User emails and IPs are not sent to Sentry
