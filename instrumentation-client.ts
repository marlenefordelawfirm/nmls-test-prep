/**
 * Client-side Instrumentation
 *
 * This file runs when the application loads in the browser.
 * It imports the client-side Sentry configuration.
 */

import * as Sentry from '@sentry/nextjs';

// Import client configuration (this will run Sentry.init())
import './sentry.client.config';

// Export router transition hook for navigation tracking
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
