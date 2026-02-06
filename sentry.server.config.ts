/**
 * Sentry Server Configuration
 *
 * This file configures Sentry for the server side (API routes, SSR, middleware).
 * Errors that occur on the server will be captured and sent to Sentry.
 *
 * Setup:
 * Add to .env.local:
 * SENTRY_DSN=https://your-key@sentry.io/your-project-id
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  debug: false,

  // Filter sensitive server-side data
  beforeSend(event, hint) {
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEV_MODE) {
      return null;
    }

    // Filter sensitive environment variables
    if (event.contexts?.runtime?.env) {
      const filtered: Record<string, string> = {};
      const allowedKeys = ['NODE_ENV', 'VERCEL_ENV', 'VERCEL_URL'];
      const runtimeEnv = event.contexts.runtime.env as Record<string, string>;

      Object.keys(runtimeEnv).forEach((key) => {
        if (allowedKeys.includes(key)) {
          filtered[key] = runtimeEnv[key] || '[Empty]';
        } else {
          filtered[key] = '[Filtered]';
        }
      });

      if (event.contexts.runtime) {
        event.contexts.runtime.env = filtered;
      }
    }

    // Scrub sensitive request data
    if (event.request) {
      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
        delete event.request.headers['x-auth-token'];
      }

      // Filter body data
      if (event.request.data) {
        const data = typeof event.request.data === 'string'
          ? JSON.parse(event.request.data)
          : event.request.data;

        // Remove password fields
        if (data.password) data.password = '[Filtered]';
        if (data.passwordHash) data.passwordHash = '[Filtered]';

        // Remove API keys
        if (data.apiKey) data.apiKey = '[Filtered]';
        if (data.token) data.token = '[Filtered]';

        event.request.data = data;
      }
    }

    return event;
  },

  // Ignore database connection errors in development
  ignoreErrors: [
    'Database connection error',
    'ECONNREFUSED',
    'ETIMEDOUT',
  ],

  // Custom fingerprinting for better error grouping
  beforeSendTransaction(event) {
    // Group similar database errors together
    const description = event.contexts?.trace?.description;
    if (typeof description === 'string' && description.includes('SELECT')) {
      event.fingerprint = ['database-query-error'];
    }

    // Group rate limit errors
    const statusCode = (event.contexts as any)?.response?.status_code;
    if (statusCode === 429) {
      event.fingerprint = ['rate-limit-exceeded'];
    }

    return event;
  },
});
