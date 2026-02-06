'use client';

import { useState } from 'react';

export default function SentryExamplePage() {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    // This will trigger an error that Sentry will catch
    // Calling a function that doesn't exist - exactly as Sentry recommends
    // @ts-expect-error - Intentionally calling undefined function for Sentry test
    (window as any).myUndefinedFunction();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Sentry Example Page
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Click the button below to trigger a test error and verify your Sentry integration.
        </p>

        <button
          onClick={handleClick}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          Click me to trigger a test error
        </button>

        {clicked && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200 font-medium">
              ✅ Error triggered! Check your Sentry dashboard in a few seconds.
            </p>
            <p className="text-green-700 dark:text-green-300 text-sm mt-2">
              Go to <a href="https://sentry.io" target="_blank" rel="noopener noreferrer" className="underline">sentry.io</a> → Issues
            </p>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
            📋 What happens when you click:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-300 text-sm">
            <li>JavaScript calls <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">myUndefinedFunction()</code></li>
            <li>This triggers a ReferenceError (function is not defined)</li>
            <li>Sentry automatically captures the error</li>
            <li>The error appears in your Sentry dashboard</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-gray-100 dark:bg-slate-800 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
            Sentry DSN: {process.env.NEXT_PUBLIC_SENTRY_DSN ? '✅ Configured' : '❌ Not configured'}
          </p>
        </div>
      </div>
    </div>
  );
}
