# Sentry Setup Complete ✅

**Date:** February 6, 2026
**Status:** READY TO TEST

---

## Files Created/Modified

### ✅ Configuration Files
- `sentry.client.config.ts` - Browser error tracking
- `sentry.server.config.ts` - Server error tracking
- `sentry.edge.config.ts` - Edge runtime tracking
- `instrumentation.ts` - Next.js instrumentation hook
- `instrumentation-client.ts` - Client initialization
- `src/app/global-error.tsx` - Global error boundary

### ✅ Build Configuration
- `next.config.ts` - Updated with `withSentryConfig`
- `.sentryclirc` - CLI configuration for source maps
- `.gitignore` - Added Sentry entries

### ✅ Test Page
- `src/app/test-sentry/page.tsx` - Test page to verify setup

### ✅ Environment Variables
- `.env` - Contains `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`
- `.env.local` - Contains `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`

---

## Current Configuration

**DSN:** `https://38eea7b20cb9344db855162b6a435955@o4510840919621632.ingest.us.sentry.io/4510840927682560`

**Features Enabled:**
- ✅ Error tracking (client + server)
- ✅ Performance monitoring (10% sampling)
- ✅ Session replay (100% of errors, 10% of sessions)
- ✅ Breadcrumbs (navigation, console, network)
- ✅ User context tracking
- ✅ PII filtering (passwords, emails, tokens)
- ✅ Source maps (for readable stack traces)
- ✅ React component annotations
- ✅ Automatic Vercel Cron monitoring

**Privacy Protection:**
- ✅ All text masked in session replays
- ✅ All media blocked in replays
- ✅ Passwords filtered from events
- ✅ Email addresses scrubbed
- ✅ API keys removed

---

## Next Steps

### 1. Test Locally

**Restart your dev server:**
```bash
# Stop current server (Ctrl+C)
npm run dev
```

**Visit test page:**
```
http://localhost:3000/test-sentry
```

**Click "Send Test Error"** - Should appear in Sentry within 10 seconds!

### 2. Check Sentry Dashboard

1. Go to https://sentry.io
2. Select your project
3. Click "Issues" in sidebar
4. You should see your test error!

### 3. Set Up Email Alerts (Recommended)

1. In Sentry: **Settings → Alerts → Create Alert**
2. **When:** Event level is error or fatal
3. **Then:** Send notification via email
4. **To:** your-email@example.com

### 4. Deploy to Vercel (Optional)

Before deploying, add these to Vercel environment variables:

**Required:**
- `SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_DSN`

**Optional (for source maps):**
- `SENTRY_AUTH_TOKEN` - Get from Sentry → Settings → Auth Tokens
- `SENTRY_ORG` - Your Sentry organization slug
- `SENTRY_PROJECT` - `nmls-test-prep`

---

## How It Works

### Error Catching Flow

**Browser Errors:**
1. Error occurs in React component
2. `global-error.tsx` catches it
3. `sentry.client.config.ts` sends to Sentry
4. You get email alert (if configured)
5. View in Sentry dashboard

**Server Errors:**
1. Error occurs in API route or SSR
2. `instrumentation.ts` → `onRequestError()` catches it
3. `sentry.server.config.ts` sends to Sentry
4. You get email alert

**Edge Runtime Errors:**
1. Error occurs in middleware or edge function
2. `sentry.edge.config.ts` catches and sends to Sentry

### What Gets Tracked

**Automatically:**
- Unhandled exceptions
- Promise rejections
- React component errors
- API route errors
- Middleware errors
- Page load performance
- API response times
- Database query times

**Manually (when you add it):**
```typescript
import * as Sentry from '@sentry/nextjs';

// Capture exception
try {
  // risky code
} catch (error) {
  Sentry.captureException(error);
}

// Track performance
Sentry.startSpan({ op: 'task', name: 'Heavy Calculation' }, () => {
  // your code
});

// Add user context
Sentry.setUser({ id: user.id, email: user.email });
```

---

## Verifying Setup

### ✅ Checklist

- [x] Sentry package installed (`@sentry/nextjs@10.38.0`)
- [x] DSN added to environment variables
- [x] Configuration files created
- [x] Instrumentation files created
- [x] Global error boundary created
- [x] next.config.ts updated
- [ ] Test page visited and error sent
- [ ] Error visible in Sentry dashboard
- [ ] Email alerts configured

### 🧪 Testing Commands

**Send test error:**
```typescript
// Visit: http://localhost:3000/test-sentry
// Click: "Send Test Error"
```

**Check if Sentry is loaded:**
```javascript
// Open browser console on any page
console.log(typeof Sentry !== 'undefined' ? 'Sentry loaded ✅' : 'Sentry not loaded ❌');
```

**Trigger manual error:**
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.captureException(new Error('Test from console'));
```

---

## Troubleshooting

### Error: "Sentry is not defined"
**Solution:** Restart dev server (`npm run dev`)

### Error: "Missing DSN"
**Solution:** Check `.env.local` has `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`

### Errors not appearing in Sentry
**Solution:**
1. Check DSN is correct
2. Wait 10-30 seconds
3. Check Sentry project is selected
4. Look in "Issues" tab, not "Performance"

### Build errors with `withSentryConfig`
**Solution:**
1. Make sure `@sentry/nextjs` is installed: `npm install @sentry/nextjs`
2. Clear `.next` folder: `rm -rf .next`
3. Rebuild: `npm run build`

### Source maps not uploading
**Solution:**
1. Create Sentry auth token
2. Add to Vercel: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`
3. Redeploy

---

## Production Deployment

### Before Deploying:

1. **Add to Vercel environment variables:**
   ```
   SENTRY_DSN=https://38eea7b20cb9344db855162b6a435955@o4510840919621632.ingest.us.sentry.io/4510840927682560
   NEXT_PUBLIC_SENTRY_DSN=https://38eea7b20cb9344db855162b6a435955@o4510840919621632.ingest.us.sentry.io/4510840927682560
   ```

2. **Configure email alerts in Sentry**

3. **Deploy:**
   ```bash
   vercel deploy --prod
   ```

4. **Test production:**
   - Visit: `https://your-domain.com/test-sentry`
   - Trigger error
   - Verify in Sentry dashboard

### After Deploying:

1. **Monitor for 24 hours** - Check Sentry daily for first week
2. **Set up Slack** (optional) - If your team grows
3. **Review errors weekly** - Fix issues as they appear
4. **Update alert thresholds** - Adjust based on traffic

---

## Cost & Limits

**Sentry Free Plan:**
- 5,000 errors/month ✅
- 10,000 performance events/month ✅
- 500 session replays/month ✅
- 7-day data retention ✅

**Current sampling:**
- Errors: 100% captured
- Performance: 10% sampled (reduces quota usage)
- Session replay: 10% of all sessions, 100% of error sessions

**Estimated usage for NMLS Test Prep:**
- ~100-500 errors/month (well under limit)
- ~1,000 performance events/month (10% of traffic)
- ~100 replays/month

---

## Support & Resources

**Documentation:**
- Sentry Next.js: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Manual Setup: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

**Dashboard:**
- Your project: https://sentry.io

**Questions:**
- Check: `MONITORING-SETUP.md`
- Sentry Discord: https://discord.gg/sentry
- Stack Overflow: Tag `sentry`

---

**Setup completed:** February 6, 2026
**Next action:** Test at http://localhost:3000/test-sentry
**Status:** Ready for production ✅
