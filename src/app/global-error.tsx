'use client';

/**
 * Global Error Boundary
 *
 * This component catches all React errors in the application
 * and sends them to Sentry for monitoring.
 *
 * It's a special Next.js file that wraps the entire app.
 */

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
        {/* This is the default Next.js error component */}
        <NextError statusCode={500} />
      </body>
    </html>
  );
}
