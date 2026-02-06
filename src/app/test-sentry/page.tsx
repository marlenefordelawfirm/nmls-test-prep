'use client';

import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';

export default function TestSentryPage() {
  const [status, setStatus] = useState('');

  const sendTestMessage = () => {
    Sentry.captureMessage('Test message from Sentry - Setup is working!', 'info');
    setStatus('✅ Test message sent! Check your Sentry dashboard in 10 seconds.');
  };

  const sendTestError = () => {
    Sentry.captureException(new Error('Test error from Sentry - This is intentional!'));
    setStatus('✅ Test error sent! Check your Sentry dashboard in 10 seconds.');
  };

  const triggerCrash = () => {
    setStatus('💥 About to crash...');
    setTimeout(() => {
      throw new Error('Uncaught error test - This will appear in Sentry!');
    }, 100);
  };

  // Recommended by Sentry for verification
  const myUndefinedFunction = () => {
    setStatus('🚀 Calling undefined function as recommended by Sentry...');
    setTimeout(() => {
      // @ts-expect-error - This is intentionally calling an undefined function for Sentry testing
      myUndefinedFunction();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Sentry Test Page
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Test your Sentry integration by clicking the buttons below.
        </p>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 space-y-4">
          {/* Test Message */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              1. Send Test Message (Info Level)
            </h3>
            <button
              onClick={sendTestMessage}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Send Test Message
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Sends a harmless info message to Sentry
            </p>
          </div>

          {/* Test Error */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              2. Send Test Error (Captured Exception)
            </h3>
            <button
              onClick={sendTestError}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              Send Test Error
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Sends a caught error to Sentry
            </p>
          </div>

          {/* Trigger Crash */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              3. Trigger Uncaught Error (Crash)
            </h3>
            <button
              onClick={triggerCrash}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Trigger Crash 💥
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Throws an uncaught error (page will crash, but Sentry will catch it)
            </p>
          </div>

          {/* Sentry Recommended Test */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              4. Sentry Recommended Test ⭐
            </h3>
            <button
              onClick={myUndefinedFunction}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold"
            >
              myUndefinedFunction() - Official Sentry Test
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Calls myUndefinedFunction() as recommended in Sentry's setup guide
            </p>
          </div>

          {/* Status */}
          {status && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-800 dark:text-green-200">{status}</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
            📊 Check Sentry Dashboard
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-300">
            <li>Click one of the buttons above</li>
            <li>Wait 10 seconds</li>
            <li>Go to <a href="https://sentry.io" target="_blank" rel="noopener noreferrer" className="underline">sentry.io</a></li>
            <li>Select your project: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">nmls-test-prep</code></li>
            <li>Click "Issues" in the left sidebar</li>
            <li>You should see your test error!</li>
          </ol>
        </div>

        {/* Environment Info */}
        <div className="mt-4 p-4 bg-gray-100 dark:bg-slate-800 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Environment Variables Status:
          </h4>
          <div className="space-y-1 text-sm font-mono">
            <div className="text-gray-700 dark:text-gray-300">
              NEXT_PUBLIC_SENTRY_DSN: {process.env.NEXT_PUBLIC_SENTRY_DSN ? '✅ Set' : '❌ Not set'}
            </div>
            {process.env.NEXT_PUBLIC_SENTRY_DSN && (
              <div className="text-xs text-gray-500 dark:text-gray-400 break-all">
                {process.env.NEXT_PUBLIC_SENTRY_DSN.substring(0, 50)}...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
