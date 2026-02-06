/**
 * Next.js Instrumentation
 *
 * This file runs once when the Next.js server starts.
 * It registers server-side and edge runtime Sentry configurations.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import server configuration
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Import edge configuration
    await import('./sentry.edge.config');
  }
}

export const onRequestError = async (
  err: Error,
  request: {
    method: string;
    url: string;
    headers: { [key: string]: string };
  },
  context: {
    routerKind: 'Pages Router' | 'App Router';
    routePath: string;
    routeType: 'render' | 'route' | 'action' | 'middleware';
  }
) => {
  // Only load Sentry if we're in the right environment
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const Sentry = await import('@sentry/nextjs');

    Sentry.captureException(err, {
      contexts: {
        request: {
          method: request.method,
          url: request.url,
          headers: request.headers,
        },
        nextjs: {
          router_kind: context.routerKind,
          route_path: context.routePath,
          route_type: context.routeType,
        },
      },
    });
  }
};
