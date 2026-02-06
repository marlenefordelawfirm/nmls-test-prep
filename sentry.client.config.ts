/**
 * Sentry Client Configuration
 *
 * This file configures Sentry for the browser/client side.
 * Errors that occur in React components, client-side code, and user interactions
 * will be captured and sent to Sentry.
 *
 * Setup:
 * 1. Create Sentry account at https://sentry.io
 * 2. Create new project (select Next.js)
 * 3. Copy DSN to .env.local:
 *    NEXT_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/your-project-id
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  // Data Source Name - connects to your Sentry project
  dsn: SENTRY_DSN,

  // Environment (development, staging, production)
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,

  // Adjust this value in production, or use tracesSampler for greater control
  // 1.0 = 100% of transactions sent to Sentry
  // 0.1 = 10% of transactions sent (recommended for high-traffic apps)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Replay for session debugging
  replaysOnErrorSampleRate: 1.0, // Capture 100% of sessions with errors
  replaysSessionSampleRate: 0.1, // Capture 10% of all sessions

  integrations: [
    Sentry.replayIntegration({
      // Mask all text content (privacy protection)
      maskAllText: true,
      // Block all media elements (images, videos)
      blockAllMedia: true,
    }),
  ],

  // Filter out sensitive information
  beforeSend(event, hint) {
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEV_MODE) {
      return null;
    }

    // Filter out localhost errors in production (shouldn't happen, but safety check)
    if (event.request?.url?.includes('localhost')) {
      return null;
    }

    // Scrub sensitive data from event
    if (event.request) {
      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['Cookie'];
      }

      // Remove query parameters that might contain sensitive data
      if (event.request.query_string) {
        event.request.query_string = '[Filtered]';
      }
    }

    // Scrub sensitive data from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
        if (breadcrumb.data) {
          // Remove password fields
          if (breadcrumb.data.password) {
            breadcrumb.data.password = '[Filtered]';
          }
          // Remove email if present
          if (breadcrumb.data.email) {
            breadcrumb.data.email = '[Filtered]';
          }
        }
        return breadcrumb;
      });
    }

    return event;
  },

  // Ignore specific errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'chrome-extension://',
    'moz-extension://',

    // Random network errors
    'Network request failed',
    'NetworkError',

    // Non-error messages
    'Non-Error promise rejection captured',

    // ResizeObserver errors (common, harmless)
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
  ],

  // Don't report errors from these URLs (ad blockers, extensions, etc.)
  denyUrls: [
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
  ],
});
