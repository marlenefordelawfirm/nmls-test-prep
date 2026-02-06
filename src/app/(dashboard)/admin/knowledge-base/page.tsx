'use client';

import { useState } from 'react';
import { Loader2, Database, RefreshCw } from 'lucide-react';

export default function KnowledgeBasePage() {
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/knowledge-base/process');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch stats');
    }
  };

  const startProcessing = async () => {
    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/knowledge-base/process', {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.result);
        setStats(data.result.statsAfter);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to process knowledge base');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Knowledge Base Management
        </h1>

        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Current Statistics</h2>
            <button
              onClick={fetchStats}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {stats && (
            <div className="space-y-4">
              <div className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-200">
                <p className="text-sm font-medium text-indigo-600 mb-1">Total Questions</p>
                <p className="text-5xl font-bold text-indigo-900">{stats.totalQuestions}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">By Content Area</h3>
                  <div className="space-y-1">
                    {stats.byContentArea?.map((area: any) => (
                      <div key={area.contentAreaId} className="text-sm">
                        {area.contentAreaId}: {area._count}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">By Difficulty</h3>
                  <div className="space-y-1">
                    {stats.byDifficulty?.map((diff: any) => (
                      <div key={diff.difficulty} className="text-sm">
                        {diff.difficulty}: {diff._count}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!stats && !error && (
            <p className="text-gray-600">Click "Refresh" to load statistics</p>
          )}
        </div>

        {/* Process Button */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Generate Questions</h2>
          <p className="text-gray-600 mb-6">
            Process study materials from PDFs and generate questions using AI.
            Target: 2000 questions with varied styles (scenario, definition, calculation, comparison, application).
          </p>

          <button
            onClick={startProcessing}
            disabled={processing}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Processing... This will take several minutes
              </>
            ) : (
              <>
                <Database className="w-6 h-6" />
                Start Batch Processing
              </>
            )}
          </button>

          <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 p-4">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> This process will take 15-30 minutes to generate 2000 questions.
              Questions are checked for plagiarism and must pass review before activation.
            </p>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-green-900 mb-4">Processing Complete!</h2>
            <div className="space-y-2">
              <p className="text-green-800">
                <strong>Sections Processed:</strong> {result.sectionsProcessed}
              </p>
              <p className="text-green-800">
                <strong>Questions Generated:</strong> {result.questionsGenerated}
              </p>
              <div className="mt-4">
                <p className="font-semibold text-green-900 mb-2">Questions by Style:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(result.questionsByStyle || {}).map(([style, count]) => (
                    <div key={style} className="text-sm text-green-800">
                      {style}: {count as number}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-red-900 mb-4">Error</h2>
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
