/**
 * Sentry Edge Runtime Configuration
 *
 * This file configures Sentry for Edge Runtime (Middleware, Edge API Routes).
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  debug: false,
});
