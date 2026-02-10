'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Info } from 'lucide-react';

type FilterType = 'all' | 'correct' | 'incorrect';

interface Question {
  questionNumber: number;
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  selectedAnswer: string;
  isCorrect: boolean;
  explanation: string | null;
  difficulty: string;
  subTopic: string | null;
}

interface ReviewData {
  attemptId: string;
  contentArea: {
    id: string;
    name: string;
  };
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  questions: Question[];
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  const contentAreaId = params.contentAreaId as string;

  const [filter, setFilter] = useState<FilterType>('all');
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId) {
      setError('No attempt ID provided');
      setLoading(false);
      return;
    }

    fetch(`/api/practice/review?attemptId=${attemptId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReviewData(data.review);
        } else {
          setError(data.error || 'Failed to load review');
        }
      })
      .catch(err => {
        console.error('Error loading review:', err);
        setError('Network error');
      })
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-neutral-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-gray-400">Loading review...</p>
        </div>
      </div>
    );
  }

  if (error || !reviewData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-neutral-800">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load review'}</p>
          <button
            onClick={() => router.push(`/practice/${contentAreaId}/results?attemptId=${attemptId}`)}
            className="text-blue-700 hover:text-blue-800 font-bold"
          >
            ← Back to Results
          </button>
        </div>
      </div>
    );
  }

  // Normalize correctAnswer: "optionA" -> "A", "A" -> "A"
  const normalizeAnswer = (answer: string) => {
    let normalized = (answer || '').trim();
    if (normalized.toLowerCase().startsWith('option')) {
      normalized = normalized.replace(/^option/i, '');
    }
    return normalized.toUpperCase();
  };

  const filteredQuestions = reviewData.questions.filter((q: Question) => {
    if (filter === 'correct') return q.isCorrect;
    if (filter === 'incorrect') return !q.isCorrect;
    return true;
  });

  const getOptionStyle = (option: string, question: Question) => {
    const isSelected = normalizeAnswer(question.selectedAnswer) === option;
    const isCorrect = normalizeAnswer(question.correctAnswer) === option;

    if (isCorrect && isSelected) {
      // Correct answer and user selected it
      return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
    } else if (isCorrect) {
      // Correct answer but user didn't select it
      return 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20';
    } else if (isSelected) {
      // User selected wrong answer
      return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    }

    return 'border-slate-200 dark:border-neutral-700';
  };

  const getOptionIcon = (option: string, question: Question) => {
    const isSelected = normalizeAnswer(question.selectedAnswer) === option;
    const isCorrect = normalizeAnswer(question.correctAnswer) === option;

    if (isCorrect && isSelected) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    } else if (isCorrect) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    } else if (isSelected) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-800 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-neutral-700">
          <button
            onClick={() => router.push(`/practice/${contentAreaId}/results?attemptId=${attemptId}`)}
            className="flex items-center gap-2 text-blue-700 hover:text-blue-800 font-semibold mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Results
          </button>

          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            Review Your Answers
          </h1>
          <p className="text-slate-600 dark:text-gray-400">
            {reviewData.contentArea.name} • {reviewData.correctAnswers}/{reviewData.totalQuestions} Correct ({Math.round(reviewData.score)}%)
          </p>

          {/* Filter Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
              }`}
            >
              All ({reviewData.questions.length})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filter === 'correct'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
              }`}
            >
              Correct ({reviewData.correctAnswers})
            </button>
            <button
              onClick={() => setFilter('incorrect')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filter === 'incorrect'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
              }`}
            >
              Incorrect ({reviewData.totalQuestions - reviewData.correctAnswers})
            </button>
          </div>
        </div>

        {/* Questions */}
        {filteredQuestions.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-12 text-center border border-slate-200 dark:border-neutral-700">
            <p className="text-slate-600 dark:text-gray-400">
              No questions match the selected filter.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQuestions.map((question) => (
              <div
                key={question.id}
                className={`bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-8 border-2 transition-all ${
                  question.isCorrect
                    ? 'border-emerald-300 dark:border-emerald-700'
                    : 'border-red-300 dark:border-red-700'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-gray-300 rounded-lg font-bold text-sm">
                        Question {question.questionNumber}
                      </span>
                      {question.subTopic && (
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-semibold text-sm">
                          {question.subTopic}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {question.questionText}
                    </h3>
                  </div>
                  {question.isCorrect ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0 ml-4" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600 flex-shrink-0 ml-4" />
                  )}
                </div>

                {/* Answer Options */}
                <div className="space-y-3 mb-6">
                  {['A', 'B', 'C', 'D'].map((option) => (
                    <div
                      key={option}
                      className={`p-4 rounded-lg border-2 transition-all ${getOptionStyle(option, question)}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-bold text-slate-700 dark:text-gray-300 min-w-[24px]">
                          {option}.
                        </span>
                        <span className="flex-1 text-slate-900 dark:text-white">
                          {question[`option${option}` as keyof Question]}
                        </span>
                        {getOptionIcon(option, question)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Result Summary */}
                <div className="bg-slate-50 dark:bg-neutral-800 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600 dark:text-gray-400">Your Answer: </span>
                      <span className={`font-bold ${question.isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                        {normalizeAnswer(question.selectedAnswer) || 'Not answered'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-gray-400">Correct Answer: </span>
                      <span className="font-bold text-emerald-600">
                        {normalizeAnswer(question.correctAnswer)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                {question.explanation && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                          Explanation
                        </p>
                        <p className="text-blue-800 dark:text-blue-200 text-sm">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-neutral-700">
          <button
            onClick={() => router.push(`/practice/${contentAreaId}/results?attemptId=${attemptId}`)}
            className="w-full px-8 py-4 bg-blue-700 text-white text-lg font-bold rounded-xl hover:bg-blue-800 transition-all shadow-lg"
          >
            Back to Results
          </button>
        </div>
      </div>
    </div>
  );
}
