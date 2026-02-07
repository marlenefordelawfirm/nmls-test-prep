'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, TrendingUp, Clock, Target, ArrowRight, Eye } from 'lucide-react';
import Link from 'next/link';

interface ResultsData {
  attemptId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  contentArea: {
    id: string;
    name: string;
  };
  strengths: string[];
  areasForReview: string[];
  passed: boolean;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const contentAreaId = params.contentAreaId as string;
  const attemptId = searchParams.get('attemptId');

  const [results, setResults] = useState<ResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!attemptId) {
        router.push('/practice');
        return;
      }

      try {
        const response = await fetch(`/api/practice/results?attemptId=${attemptId}`);
        const data = await response.json();

        if (data.success) {
          setResults(data.results);
        } else {
          console.error('Failed to load results:', data.error);
        }
      } catch (error) {
        console.error('Error loading results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [attemptId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load results</p>
          <Link href="/practice" className="text-blue-700 hover:text-blue-800 font-bold">
            ← Back to Practice
          </Link>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const accuracyPercentage = Math.round((results.correctAnswers / results.totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-800 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Score */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-12 text-center border border-slate-200">
          {results.passed ? (
            <div className="mb-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                Section Mastered! Great work!
              </h1>
              <p className="text-lg text-slate-600">
                You've demonstrated strong understanding of {results.contentArea.name}
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-12 h-12 text-blue-600" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                Keep Practicing!
              </h1>
              <p className="text-lg text-slate-600">
                You're making progress in {results.contentArea.name}
              </p>
            </div>
          )}

          <div className="relative inline-block">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="transparent"
                stroke="#E0E7FF"
                strokeWidth="16"
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="transparent"
                stroke={results.passed ? '#10B981' : '#3B82F6'}
                strokeWidth="16"
                strokeDasharray="502.65"
                strokeDashoffset={502.65 - (502.65 * results.score) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-black text-slate-900">{results.score}%</span>
              <span className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                Overall Score
              </span>
            </div>
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-blue-700" />
              <h3 className="text-sm font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider">
                Correct Answers
              </h3>
            </div>
            <p className="text-4xl font-black text-slate-900">
              {results.correctAnswers}/{results.totalQuestions}
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-blue-700" />
              <h3 className="text-sm font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider">
                Time Spent
              </h3>
            </div>
            <p className="text-4xl font-black text-slate-900">
              {formatTime(results.timeSpent)}
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-blue-700" />
              <h3 className="text-sm font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider">
                Accuracy
              </h3>
            </div>
            <p className="text-4xl font-black text-slate-900">
              {accuracyPercentage}%
            </p>
          </div>
        </div>

        {/* Strengths and Areas for Review */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          {results.strengths.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Strengths</h3>
              </div>
              <div className="space-y-2">
                {results.strengths.map((strength, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-slate-700">{strength}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Areas for Review */}
          {results.areasForReview.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Areas for Review</h3>
              </div>
              <div className="space-y-2">
                {results.areasForReview.map((area, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-amber-500 rounded-full flex-shrink-0" />
                    <span className="text-slate-700">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/practice"
            className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-blue-700 text-white text-lg font-bold rounded-xl hover:bg-blue-800 transition-all shadow-lg"
          >
            Continue to Next Section
            <ArrowRight className="w-5 h-5" />
          </Link>

          <button
            onClick={() => router.push(`/practice/${contentAreaId}/review?attemptId=${attemptId}`)}
            className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-neutral-900 text-slate-700 dark:text-gray-300 text-lg font-bold rounded-xl border-2 border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-700 dark:bg-neutral-800 transition-all"
          >
            <Eye className="w-5 h-5" />
            Review Answers
          </button>
        </div>
      </div>
    </div>
  );
}
