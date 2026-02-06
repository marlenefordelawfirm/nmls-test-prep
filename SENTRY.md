# Sentry Integration Guide

This document provides comprehensive instructions for setting up, configuring, and troubleshooting Sentry error monitoring in this Next.js application.

## Table of Contents

1. [Overview](#overview)
2. [Initial Setup](#initial-setup)
3. [Configuration Files](#configuration-files)
4. [Environment Variables](#environment-variables)
5. [Testing Sentry Integration](#testing-sentry-integration)
6. [Extracting and Using Sentry Issues](#extracting-and-using-sentry-issues)
7. [Common Issues and Solutions](#common-issues-and-solutions)
8. [Best Practices](#best-practices)

---

## Overview

This application uses **Sentry (@sentry/nextjs v10.38.0)** for error monitoring and performance tracking across:
- Client-side (browser) errors
- Server-side (Node.js) errors
- Edge runtime errors
- API route errors
- Unhandled exceptions and promise rejections

**Key Features:**
- Automatic error capture
- Source map upload for debugging
- Performance monitoring
- Session replay capabilities
- Privacy controls (PII scrubbing)

---

## Initial Setup

### 1. Install Sentry

```bash
npm install @sentry/nextjs
```

### 2. Get Your Sentry DSN

1. Create a project at [sentry.io](https://sentry.io)
2. Copy your DSN (Data Source Name) from the project settings
3. Format: `https://<key>@<org-id>.ingest.us.sentry.io/<project-id>`

Example DSN used in this project:
```
https://38eea7b20cb9344db855162b6a435955@o4510840919621632.ingest.us.sentry.io/4510840927682560
```

---

## Configuration Files

### Required Files and Their Purpose

#### 1. **`sentry.client.config.ts`** (Root directory)
Configures Sentry for browser/client-side error tracking.

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Privacy: Remove PII
  beforeSend(event) {
    if (event.request) {
      delete event.request.cookies;
    }
    return event;
  },
});
```

**Key Points:**
- Uses `NEXT_PUBLIC_SENTRY_DSN` (client-accessible env var)
- Session replay with privacy masking enabled
- Cookies automatically removed for privacy

#### 2. **`sentry.server.config.ts`** (Root directory)
Configures Sentry for server-side error tracking (Node.js runtime).

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,

  beforeSend(event) {
    // Scrub sensitive environment variables
    if (event.contexts?.runtime) {
      const runtimeEnv = event.contexts.runtime.env as Record<string, string>;
      if (runtimeEnv) {
        delete runtimeEnv.DATABASE_URL;
        delete runtimeEnv.NEXTAUTH_SECRET;
        delete runtimeEnv.OPENAI_API_KEY;
        // ... other sensitive vars
      }
    }
    return event;
  },

  beforeSendTransaction(event) {
    // Filter out database queries from traces
    const description = event.contexts?.trace?.description;
    if (typeof description === 'string' && description.includes('SELECT')) {
      return null;
    }
    return event;
  },
});
```

**Key Points:**
- Uses `SENTRY_DSN` (server-only env var)
- Scrubs sensitive environment variables
- Filters database queries from performance traces

#### 3. **`sentry.edge.config.ts`** (Root directory)
Configures Sentry for Edge runtime (middleware, edge functions).

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

**Key Points:**
- Lightweight config for edge runtime
- Uses public DSN (no Node.js APIs available)

#### 4. **`instrumentation.ts`** (Root directory)
Next.js instrumentation file for runtime initialization.

```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = async (
  err: Error,
  request: { path: string },
  context: { routerKind: string }
) => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const Sentry = await import('@sentry/nextjs');
    Sentry.captureException(err, {
      contexts: {
        request: {
          url: request.path,
        },
        nextjs: {
          router_kind: context.routerKind,
        },
      },
    });
  }
};
```

**Key Points:**
- Loads appropriate config based on runtime
- Captures server-side request errors automatically
- Required for Next.js 15+ error handling

#### 5. **`instrumentation-client.ts`** (Root directory)
Client-side instrumentation for router transitions.

```typescript
import * as Sentry from '@sentry/nextjs';
import './sentry.client.config';

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
```

**Key Points:**
- Tracks client-side navigation
- Required for Next.js client instrumentation

#### 6. **`src/app/global-error.tsx`**
Global error boundary for catching React errors.

```typescript
'use client';

import * as Sentry from '@sentry/nextjs';
import NextError from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <NextError statusCode={500} />
      </body>
    </html>
  );
}
```

**Key Points:**
- Catches unhandled React errors
- Automatically sends to Sentry
- Shows error UI to users

#### 7. **`next.config.ts`**
Wraps Next.js config with Sentry for build-time integration.

```typescript
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* your config */
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  silent: !process.env.CI,

  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",

  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
    reactComponentAnnotation: {
      enabled: true,
    },
    automaticVercelMonitors: true,
  },
});
```

**Key Points:**
- Uploads source maps for better stack traces
- Tunnels requests through `/monitoring` to bypass ad blockers
- Deletes source maps after upload for security
- Enables automatic React component tracking

---

## Environment Variables

### Local Development (`.env`, `.env.local`)

Add these variables to both files:

```bash
# Sentry DSN (same value for both)
SENTRY_DSN=https://38eea7b20cb9344db855162b6a435955@o4510840919621632.ingest.us.sentry.io/4510840927682560
NEXT_PUBLIC_SENTRY_DSN=https://38eea7b20cb9344db855162b6a435955@o4510840919621632.ingest.us.sentry.io/4510840927682560

# Optional: For source map uploads (not required for basic setup)
SENTRY_ORG=your-org-name
SENTRY_PROJECT=nmls-test-prep
SENTRY_AUTH_TOKEN=your-auth-token
```

**Important Distinctions:**
- `SENTRY_DSN`: Server-side only (Node.js, API routes)
- `NEXT_PUBLIC_SENTRY_DSN`: Client-side accessible (browser, edge)
- Both should have the **same value** (the DSN from Sentry)

### Production/Vercel

Add variables using Vercel CLI:

```bash
# Add to all environments (production, preview, development)
vercel env add SENTRY_DSN production preview development
vercel env add NEXT_PUBLIC_SENTRY_DSN production preview development

# Optional: For source map uploads
vercel env add SENTRY_ORG production preview development
vercel env add SENTRY_PROJECT production preview development
vercel env add SENTRY_AUTH_TOKEN production preview development
```

Or via Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add each variable for all environments
3. Redeploy for changes to take effect

---

## Testing Sentry Integration

### Method 1: Node.js Script (Recommended for Initial Verification)

Create `test-sentry.js`:

```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: 'development',
  tracesSampleRate: 1.0,
});

console.log('Sending test error to Sentry...');

Sentry.captureException(new Error('Test error - Sentry SDK verification'));
Sentry.captureMessage('Test message - Setup verification', 'info');

Sentry.flush(2000).then(() => {
  console.log('✅ Test events sent to Sentry!');
  process.exit(0);
});
```

Run it:
```bash
node test-sentry.js
```

**Expected Result:**
- Console shows "✅ Test events sent to Sentry!"
- Sentry dashboard shows the error within 10-20 seconds

### Method 2: Browser Test Page

Visit `/sentry-example-page` (already created in this project):

```typescript
// Page with button that triggers: myUndefinedFunction()
// This causes a ReferenceError that Sentry captures
```

Click the button → Error appears in Sentry dashboard.

### Method 3: Programmatic API Test

Create an API route:

```typescript
// src/app/api/test-sentry/route.ts
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

export async function GET() {
  Sentry.captureException(new Error('API test error'));
  return NextResponse.json({ message: 'Error sent to Sentry' });
}
```

Test with:
```bash
curl http://localhost:3000/api/test-sentry
```

### Verification Checklist

After testing, verify in Sentry dashboard:
- ✅ Error appears in Issues tab
- ✅ Stack trace is readable (not minified)
- ✅ Environment is correct (development/production)
- ✅ User context is captured (if applicable)
- ✅ Breadcrumbs show events leading to error
- ✅ No sensitive data (passwords, tokens) visible

---

## Extracting and Using Sentry Issues

### Accessing Issues

1. **Go to Sentry Dashboard**: https://sentry.io
2. **Select Your Project**: nmls-test-prep
3. **Navigate to Issues**: Left sidebar → Issues

### Understanding an Issue

Each Sentry issue contains:

#### 1. **Error Overview**
- **Title**: Error type and message
- **Event ID**: Unique identifier (e.g., `7c4374339...`)
- **First/Last Seen**: When error first occurred and last occurrence
- **Frequency**: How often it's happening
- **Users Affected**: Number of unique users experiencing this

#### 2. **Stack Trace**
```
TypeError: Sentry.captureException is not a function
  at /Users/devon/Mortgage test/nmls-test-prep/test-sentry.mjs:13:8
  at ModuleJob.run (node:internal/modules/esm/module_job:371:25)
```

**How to Use:**
- Identify the **exact line** where error occurred
- Follow the call stack to understand execution path
- Click line numbers to see source code (if source maps uploaded)

#### 3. **Breadcrumbs**
Shows events leading up to the error:
```
Console log: "Sending test error to Sentry..."
Function call: captureException(...)
```

**How to Use:**
- Reconstruct user's actions before error
- Identify patterns (e.g., always happens after login)

#### 4. **Tags**
Filterable metadata:
- `environment`: development, production
- `runtime`: node, browser
- `handled`: true/false (was it caught or uncaught?)
- `level`: error, warning, info
- Custom tags you add

**How to Use:**
- Filter issues by environment: "Show only production errors"
- Group by tag: "All errors from iOS users"

#### 5. **Context**
Additional data:
- **User**: email, ID, username
- **Device**: OS, browser, version
- **Runtime**: Node version, architecture
- **Request**: URL, method, headers, body

**How to Use:**
- Reproduce bugs with exact environment
- Identify device-specific issues

#### 6. **Similar Issues**
Sentry groups similar errors together.

**How to Use:**
- See if error affects multiple users
- Track resolution across all occurrences

### Extracting Data for Troubleshooting

#### Use Case 1: "User reports app crashed"

1. Go to Sentry Issues
2. Filter by:
   - User email/ID
   - Time range (when they reported it)
3. Look at breadcrumbs to see what they were doing
4. Check stack trace for the failing component
5. Review context for device/browser info

**Example Query:**
```
user.email:john@example.com timestamp:[2024-02-06 TO 2024-02-07]
```

#### Use Case 2: "Production has high error rate"

1. Go to Issues → Sort by "Events" (descending)
2. Identify most frequent errors
3. Check "Users Affected" to prioritize
4. Review tags to find patterns:
   - Is it iOS only? (`os.name:iOS`)
   - Specific browser? (`browser.name:Safari`)
   - Certain route? (`transaction:/api/payment`)

#### Use Case 3: "Need to debug TypeScript compilation error"

1. Look at stack trace in Sentry
2. If source maps uploaded, click line numbers
3. See **original TypeScript code** (not minified JS)
4. Identify exact type that's failing
5. Check context for runtime values

**Example:**
```typescript
// Stack trace shows:
Property 'error' does not exist on type 'AuthResult'

// Context shows:
authResult = { session: {...} }  // No error property!
```

#### Use Case 4: "Performance issue - slow API"

1. Go to Performance tab (not Issues)
2. Find slow transaction (e.g., `/api/analytics`)
3. View trace to see:
   - Database query time
   - External API calls
   - Processing time
4. Identify bottleneck

### Downloading Issue Data

#### Via UI:
- Click issue → "Share" → "Copy Event JSON"

#### Via API:
```bash
curl -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  "https://sentry.io/api/0/organizations/ORG/issues/ISSUE_ID/events/"
```

Returns JSON with full error details.

---

## Common Issues and Solutions

### Issue 1: "Sentry not capturing errors"

**Symptoms:**
- Test errors don't appear in dashboard
- Dashboard shows "Waiting to receive first event"

**Debugging Steps:**
1. Check environment variables:
   ```bash
   # In your app
   console.log('DSN:', process.env.NEXT_PUBLIC_SENTRY_DSN);
   ```
   Should print the full DSN, not `undefined`

2. Check network requests:
   - Open browser DevTools → Network tab
   - Look for requests to `sentry.io` or `ingest.us.sentry.io`
   - If none found, Sentry isn't initialized

3. Check console for Sentry errors:
   ```
   [Sentry] Unable to send event due to DSN configuration
   ```

**Solutions:**
- Ensure `NEXT_PUBLIC_SENTRY_DSN` is set (note the `NEXT_PUBLIC_` prefix)
- Restart dev server after adding env vars
- Verify DSN format is correct
- Check if ad blocker is blocking Sentry (use `tunnelRoute` in config)

### Issue 2: "TypeScript errors during build"

**Symptoms:**
```
Property 'error' does not exist on type 'X'
Type 'X' is not assignable to type 'Y'
```

**Solutions:**
1. Use type assertions when needed:
   ```typescript
   const context = event.contexts as Record<string, any>;
   ```

2. Add proper return type annotations:
   ```typescript
   type AuthResult =
     | { error: NextResponse; session?: never }
     | { session: Session; error?: never };

   export async function requireAuth(): Promise<AuthResult> { ... }
   ```

3. Use discriminated unions for checking:
   ```typescript
   if (authResult.error) {
     return authResult.error; // TypeScript knows error exists
   }
   const { session } = authResult; // TypeScript knows session exists
   ```

### Issue 3: "Source maps not uploading"

**Symptoms:**
- Stack traces show minified code
- Can't see original TypeScript source

**Solutions:**
1. Add Sentry auth token:
   ```bash
   SENTRY_AUTH_TOKEN=your-token
   ```

2. Set org and project:
   ```bash
   SENTRY_ORG=your-org
   SENTRY_PROJECT=nmls-test-prep
   ```

3. Check build output for:
   ```
   [@sentry/nextjs] Info: Successfully uploaded source maps
   ```

4. If warning shows:
   ```
   Warning: No auth token provided
   ```
   Generate token at: https://sentry.io/settings/account/api/auth-tokens/

### Issue 4: "Too many events - quota exceeded"

**Symptoms:**
```
Event dropped due to rate limit
```

**Solutions:**
1. Reduce sample rate:
   ```typescript
   tracesSampleRate: 0.1, // Only 10% of transactions
   ```

2. Filter out noisy errors:
   ```typescript
   beforeSend(event) {
     // Ignore known browser extension errors
     if (event.exception?.values?.[0]?.value?.includes('chrome-extension')) {
       return null;
     }
     return event;
   }
   ```

3. Increase Sentry plan quota

### Issue 5: "Sensitive data visible in Sentry"

**Symptoms:**
- API keys in context
- User passwords in breadcrumbs
- Database URLs in environment

**Solutions:**
1. Scrub in `beforeSend`:
   ```typescript
   beforeSend(event) {
     // Remove sensitive data
     if (event.request) {
       delete event.request.cookies;
       delete event.request.headers?.Authorization;
     }

     if (event.contexts?.runtime?.env) {
       const env = event.contexts.runtime.env as Record<string, string>;
       delete env.DATABASE_URL;
       delete env.NEXTAUTH_SECRET;
     }

     return event;
   }
   ```

2. Use Session Replay with masking:
   ```typescript
   Sentry.replayIntegration({
     maskAllText: true,      // Mask all text content
     blockAllMedia: true,    // Block images/videos
     maskAllInputs: true,    // Mask form inputs
   })
   ```

3. Configure data scrubbing in Sentry dashboard:
   - Settings → Data Privacy → Advanced Data Scrubbing

---

## Best Practices

### 1. **Use Appropriate Sample Rates**

```typescript
// Development: Capture everything
tracesSampleRate: 1.0,
replaysSessionSampleRate: 1.0,

// Production: Sample to stay within quota
tracesSampleRate: 0.1,        // 10% of transactions
replaysSessionSampleRate: 0.1, // 10% of sessions
replaysOnErrorSampleRate: 1.0, // 100% when error occurs
```

### 2. **Add Custom Context**

```typescript
import * as Sentry from '@sentry/nextjs';

// In API routes
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
  subscription: user.subscriptionTier,
});

Sentry.setContext('test_attempt', {
  attemptId: attempt.id,
  contentArea: attempt.contentAreaId,
  questionsTotal: attempt.totalQuestions,
});

// Now errors include this context automatically
```

### 3. **Tag Errors for Better Filtering**

```typescript
Sentry.setTag('feature', 'exam-submission');
Sentry.setTag('payment_method', 'stripe');

// Later: Filter issues by tag in dashboard
```

### 4. **Capture Expected Errors Appropriately**

```typescript
try {
  await processPayment();
} catch (error) {
  // Don't flood Sentry with expected errors
  if (error.code === 'INSUFFICIENT_FUNDS') {
    console.log('Expected error:', error);
    return { success: false, error: 'Insufficient funds' };
  }

  // Only capture unexpected errors
  Sentry.captureException(error);
  throw error;
}
```

### 5. **Use Breadcrumbs for Debugging Context**

```typescript
Sentry.addBreadcrumb({
  category: 'exam',
  message: 'Starting exam submission',
  level: 'info',
  data: {
    examId: exam.id,
    questionsAnswered: answers.length,
  },
});

// Later errors will show this breadcrumb trail
```

### 6. **Monitor Performance Bottlenecks**

```typescript
// Manual transaction for custom tracking
const transaction = Sentry.startTransaction({
  name: 'Process Exam Results',
  op: 'exam.process',
});

const span = transaction.startChild({
  op: 'db.query',
  description: 'Calculate analytics',
});

await calculateAnalytics();

span.finish();
transaction.finish();
```

### 7. **Test in All Environments**

- ✅ Local development (http://localhost:3000)
- ✅ Vercel preview deployments
- ✅ Production
- ✅ Different browsers (Chrome, Safari, Firefox)
- ✅ Mobile devices (iOS, Android)

### 8. **Set Up Alerts**

In Sentry dashboard:
1. Project Settings → Alerts
2. Create alert for:
   - Error rate exceeds X per hour
   - New error type appears
   - Specific error happens again
3. Send to: Email, Slack, Discord, etc.

### 9. **Review Issues Weekly**

- Prioritize by "Users Affected"
- Mark issues as "Resolved" when fixed
- Add notes on how you fixed it
- Create GitHub issues for tracking

### 10. **Use Source Maps in Production**

Ensure these are set:
```typescript
// next.config.ts
sourcemaps: {
  deleteSourcemapsAfterUpload: true, // Security
}
```

Benefits:
- See TypeScript code, not minified JS
- Better debugging experience
- Source maps deleted after upload (not public)

---

## Quick Reference Commands

```bash
# Test Sentry locally
node test-sentry.js

# Add Vercel env vars
vercel env add SENTRY_DSN
vercel env add NEXT_PUBLIC_SENTRY_DSN

# Check Sentry config
npm run build  # Should show Sentry upload logs

# View Sentry logs
# Check browser console for:
[Sentry] Successfully sent event

# Clear test errors
# In Sentry dashboard: Issues → Select All → Archive
```

---

## Resources

- **Sentry Next.js Docs**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Sentry API Reference**: https://docs.sentry.io/api/
- **Source Maps Guide**: https://docs.sentry.io/platforms/javascript/sourcemaps/
- **Data Scrubbing**: https://docs.sentry.io/product/data-management-settings/scrubbing/
- **Session Replay**: https://docs.sentry.io/product/session-replay/

---

## Maintenance Notes

**Last Updated**: February 6, 2026
**Sentry Version**: @sentry/nextjs v10.38.0
**Next.js Version**: 16.1.6
**Project**: nmls-test-prep

**Change Log**:
- Initial Sentry setup with manual configuration
- Fixed 10 TypeScript compilation errors
- Configured privacy settings (PII scrubbing)
- Created test pages: `/test-sentry`, `/sentry-example-page`
- Deployed to Vercel production successfully
- Verified error capture in development environment
