'use client';

import { CheckCircle, XCircle, Clock, Download, BookOpen, TrendingUp, AlertCircle } from 'lucide-react';
import { TestAttempt } from '@prisma/client';

interface ExamResultsProps {
  result: TestAttempt & {
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  };
  breakdown: Array<{
    contentAreaId: string;
    contentAreaName: string;
    correct: number;
    total: number;
    percentage: number;
    totalTimeSpent: number;
    avgTimePerQuestion: number;
  }>;
  slowestQuestions: Array<{
    questionText: string;
    timeSpent: number;
    contentArea: string;
    isCorrect: boolean;
  }>;
  recommendations: string[];
}

export function ExamResults({ result, breakdown, slowestQuestions, recommendations }: ExamResultsProps) {
  // Calculate if passed
  const passed = result.rawScore >= 75;

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate time spent
  const startTime = new Date(result.startTime).getTime();
  const endTime = result.endTime ? new Date(result.endTime).getTime() : Date.now();
  const timeSpent = Math.floor((endTime - startTime) / 1000); // seconds

  const totalExamTime = 190 * 60;
  const timeRemaining = Math.max(0, totalExamTime - timeSpent);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Pass/Fail Status */}
        <div className={`rounded-lg p-8 mb-8 text-center ${
          passed
            ? 'bg-green-50 border-2 border-green-200'
            : 'bg-red-50 border-2 border-red-200'
        }`}>
          {passed ? (
            <>
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-green-900 mb-2">
                Congratulations! You Passed!
              </h1>
              <p className="text-lg text-green-700">
                You have successfully passed the NMLS National Exam simulation.
              </p>
            </>
          ) : (
            <>
              <XCircle className="w-20 h-20 text-red-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-red-900 mb-2">
                Keep Studying
              </h1>
              <p className="text-lg text-red-700">
                You did not pass this time, but you're making progress. Review your results below.
              </p>
            </>
          )}
        </div>

        {/* Score Summary */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Score Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* LOFT Adjusted Score */}
            <div className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-200">
              <p className="text-sm font-medium text-indigo-600 mb-1">Final Score</p>
              <p className="text-5xl font-bold text-indigo-900">
                {(result.loftAdjustedScore || result.rawScore).toFixed(1)}%
              </p>
              <p className="text-sm text-indigo-700 mt-2">
                {result.loftAdjustedScore ? 'Difficulty-weighted score' : 'Your score'}
              </p>
            </div>

            {/* Raw Score */}
            <div className="bg-gray-50 dark:bg-neutral-950 rounded-lg p-6 border-2 border-gray-200 dark:border-neutral-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Raw Score</p>
              <p className="text-5xl font-bold text-gray-900 dark:text-white">
                {result.rawScore.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-200 mt-2">
                {result.correctAnswers} / {result.totalQuestions} correct
              </p>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-neutral-700">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Passing Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">75%</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Time Used</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                {formatTime(timeSpent)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Time Remaining</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatTime(timeRemaining)}
              </p>
            </div>
          </div>
        </div>

        {/* Personalized Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-lg p-8 mb-8 border-2 border-indigo-200">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Personalized Study Recommendations</h2>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white dark:bg-neutral-900 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-800 dark:text-gray-100">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Area Breakdown */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Performance by Content Area</h2>

          <div className="space-y-4">
            {breakdown.map((area, idx) => {
              const percentage = area.percentage;
              const isPassing = percentage >= 75;
              const avgTime = Math.floor(area.avgTimePerQuestion / 60);
              const avgSec = area.avgTimePerQuestion % 60;

              return (
                <div key={idx} className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{area.contentAreaName}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Avg time: {avgTime}:{avgSec.toString().padStart(2, '0')} per question
                      </p>
                    </div>
                    <span className={`font-bold ${
                      isPassing ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {percentage}%
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Progress bar */}
                    <div className="flex-1 bg-gray-200 dark:bg-neutral-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          isPassing ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Stats */}
                    <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {area.correct} / {area.total} correct
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Analysis - Slowest Questions */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Time Analysis</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            These questions took you the longest to answer. Consider reviewing these topics to improve your speed.
          </p>

          <div className="space-y-3">
            {slowestQuestions.map((q, idx) => (
              <div key={idx} className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4 hover:border-gray-300 dark:border-neutral-600 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2">{q.questionText}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 rounded">
                        {q.contentArea}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        q.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {q.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 flex-shrink-0">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono font-semibold">
                      {Math.floor(q.timeSpent / 60)}:{(q.timeSpent % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LOFT Scoring Explanation */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">About LOFT Scoring</h3>
          <p className="text-blue-800 text-sm">
            LOFT (Linear On-The-Fly Testing) adjusts your score based on question difficulty.
            Harder questions contribute more to your score. Your final score is a blend of 70%
            difficulty-adjusted score and 30% raw score, better reflecting your true knowledge level.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex-1 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
          >
            Back to Dashboard
          </button>

          <button
            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            disabled
            title="Coming in Phase 5.5"
          >
            <BookOpen className="w-5 h-5" />
            Review Questions
            <span className="text-xs bg-indigo-500 px-2 py-1 rounded">Coming Soon</span>
          </button>

          {passed && (
            <button
              className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              disabled
              title="Coming in Phase 5.4"
            >
              <Download className="w-5 h-5" />
              Download Certificate
              <span className="text-xs bg-green-500 px-2 py-1 rounded">Coming Soon</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
