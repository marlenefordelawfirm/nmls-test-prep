'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, X, ArrowRight, ArrowLeft, CheckCircle2, XCircle, Info } from 'lucide-react';

interface Question {
  id: string;
  questionNumber: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string | null;
  difficulty: string;
  subTopic: string;
}

interface TestData {
  attemptId: string;
  contentArea: {
    id: string;
    name: string;
  };
  questions: Question[];
  totalQuestions: number;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const contentAreaId = params.contentAreaId as string;

  const [testData, setTestData] = useState<TestData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [lockedQuestions, setLockedQuestions] = useState<Set<number>>(new Set());

  // Start test on mount
  useEffect(() => {
    const startTest = async () => {
      try {
        const response = await fetch('/api/practice/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentAreaId })
        });

        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Failed to start test');
          return;
        }

        setTestData(data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load test');
        setIsLoading(false);
      }
    };

    startTest();
  }, [contentAreaId]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Normalize correctAnswer: "optionA" -> "A", "A" -> "A"
  const normalizeAnswer = (answer: string) => {
    let normalized = (answer || '').trim();
    if (normalized.toLowerCase().startsWith('option')) {
      normalized = normalized.replace(/^option/i, '');
    }
    return normalized.toUpperCase();
  };

  const handleAnswerSelect = (answer: string) => {
    // In study mode, prevent changing answer on locked questions
    if (isStudyMode && lockedQuestions.has(currentQuestionIndex)) {
      return;
    }

    setSelectedAnswer(answer);

    // In study mode, lock the question immediately and save the answer
    if (isStudyMode) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestionIndex]: answer
      }));
      setLockedQuestions(prev => new Set(prev).add(currentQuestionIndex));
    }
  };

  const handleNext = () => {
    if (selectedAnswer) {
      // Save answer
      setAnswers(prev => ({
        ...prev,
        [currentQuestionIndex]: selectedAnswer
      }));
    }

    if (currentQuestionIndex < (testData?.totalQuestions || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      // Load previously selected answer if exists
      setSelectedAnswer(answers[currentQuestionIndex + 1] || '');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      // Save current answer
      if (selectedAnswer) {
        setAnswers(prev => ({
          ...prev,
          [currentQuestionIndex]: selectedAnswer
        }));
      }
      setCurrentQuestionIndex(prev => prev - 1);
      // Load previously selected answer
      setSelectedAnswer(answers[currentQuestionIndex - 1] || '');
    }
  };

  const handleSubmit = async () => {
    // Save final answer
    const finalAnswers = { ...answers };
    if (selectedAnswer) {
      finalAnswers[currentQuestionIndex] = selectedAnswer;
    }

    // Format answers for API
    const submittedAnswers = testData!.questions.map((q, index) => ({
      questionId: q.id,
      selectedAnswer: finalAnswers[index] || ''
    })).filter(a => a.selectedAnswer); // Only submit answered questions

    // Warn if no answers provided
    if (submittedAnswers.length === 0) {
      const confirmed = confirm(
        'You haven\'t answered any questions. This will result in a 0% score. Continue?'
      );
      if (!confirmed) return;
    } else if (submittedAnswers.length < testData!.totalQuestions) {
      // Warn if some questions unanswered
      const unanswered = testData!.totalQuestions - submittedAnswers.length;
      const confirmed = confirm(
        `You have ${unanswered} unanswered question(s). These will be marked incorrect. Continue?`
      );
      if (!confirmed) return;
    }

    // Log what we're submitting for debugging
    console.log('[CLIENT] Submitting answers:', {
      attemptId: testData!.attemptId,
      totalAnswers: submittedAnswers.length,
      answers: submittedAnswers.map((a, i) => ({
        index: i,
        questionId: a.questionId,
        selectedAnswer: a.selectedAnswer,
        answerType: typeof a.selectedAnswer,
        answerLength: a.selectedAnswer?.length
      }))
    });

    try {
      const response = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: testData!.attemptId,
          answers: submittedAnswers
        })
      });

      const data = await response.json();

      if (data.success) {
        // Navigate to results page
        router.push(`/practice/${contentAreaId}/results?attemptId=${testData!.attemptId}`);
      } else {
        alert('Failed to submit test: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test. Please try again.');
    }
  };

  const handleExit = () => {
    if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
      router.push('/practice');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your practice test...</p>
        </div>
      </div>
    );
  }

  if (error || !testData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load test'}</p>
          <button
            onClick={() => router.push('/practice')}
            className="text-blue-700 hover:text-blue-800 font-bold"
          >
            ← Back to Practice
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = testData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / testData.totalQuestions) * 100;
  const isLastQuestion = currentQuestionIndex === testData.totalQuestions - 1;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleExit}
                className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Question {currentQuestionIndex + 1} of {testData.totalQuestions}
                </p>
                <p className="text-xs text-slate-500">{testData.contentArea.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Study Mode Toggle */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsStudyMode(prev => !prev)}
                  className="flex items-center gap-2"
                  title={isStudyMode ? 'Disable Study Mode' : 'Enable Study Mode'}
                >
                  <span className="text-xs font-semibold text-slate-600 dark:text-gray-400">Study Mode</span>
                  <div
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      isStudyMode ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-neutral-600'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        isStudyMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </button>
                <div className="relative group">
                  <Info className="w-4 h-4 text-slate-400 dark:text-gray-500 cursor-help" />
                  <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-slate-900 dark:bg-neutral-700 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <p className="font-semibold mb-1">What is Study Mode?</p>
                    <p className="text-slate-300 dark:text-gray-300 leading-relaxed">
                      When enabled, you get instant feedback after each answer. You'll see if you were correct or incorrect, the right answer is highlighted, and the explanation is shown. Your answer locks after selection.
                    </p>
                    <div className="absolute -top-1 right-3 w-2 h-2 bg-slate-900 dark:bg-neutral-700 rotate-45" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-bold">{formatTime(timer)}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-slate-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-700 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Question Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-700 p-8 mb-6">
          {/* Question */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                {currentQuestion.difficulty}
              </span>
              <span className="text-xs text-slate-500">{currentQuestion.subTopic}</span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQuestion.questionText}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {(() => {
              const isLocked = isStudyMode && lockedQuestions.has(currentQuestionIndex);
              const correctLetter = normalizeAnswer(currentQuestion.correctAnswer);

              return ['A', 'B', 'C', 'D'].map((option) => {
                const optionText = currentQuestion[`option${option}` as keyof Question] as string;
                const isSelected = selectedAnswer === option;

                // Determine styling based on study mode state
                let borderClass: string;
                let icon: React.ReactNode = null;

                if (isLocked) {
                  const isCorrectOption = correctLetter === option;
                  if (isCorrectOption && isSelected) {
                    borderClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
                    icon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
                  } else if (isCorrectOption) {
                    borderClass = 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20';
                    icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
                  } else if (isSelected) {
                    borderClass = 'border-red-500 bg-red-50 dark:bg-red-900/20';
                    icon = <XCircle className="w-5 h-5 text-red-600" />;
                  } else {
                    borderClass = 'border-slate-200 dark:border-neutral-700';
                  }
                } else {
                  borderClass = isSelected
                    ? 'border-blue-700 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50';
                  if (isSelected) {
                    icon = <CheckCircle2 className="w-5 h-5 text-blue-700" />;
                  }
                }

                return (
                  <label
                    key={option}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${borderClass} ${
                      isLocked ? 'cursor-default' : 'cursor-pointer'
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={isSelected}
                      onChange={() => handleAnswerSelect(option)}
                      disabled={isLocked}
                      className="mt-1 w-5 h-5 text-blue-700 focus:ring-2 focus:ring-blue-700"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">{option}.</span>
                        {icon}
                      </div>
                      <p className="text-slate-700 dark:text-gray-300 leading-relaxed">{optionText}</p>
                    </div>
                  </label>
                );
              });
            })()}
          </div>

          {/* Study Mode Feedback */}
          {isStudyMode && lockedQuestions.has(currentQuestionIndex) && (() => {
            const correctLetter = normalizeAnswer(currentQuestion.correctAnswer);
            const isCorrect = normalizeAnswer(selectedAnswer) === correctLetter;

            return (
              <div className="mt-6 space-y-4">
                {/* Correct/Incorrect Banner */}
                <div className={`flex items-center gap-3 p-4 rounded-lg ${
                  isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  )}
                  <p className={`font-bold ${isCorrect ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'}`}>
                    {isCorrect
                      ? 'Correct!'
                      : `Incorrect. The correct answer is ${correctLetter}.`}
                  </p>
                </div>

                {/* Explanation */}
                {currentQuestion.explanation && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Explanation</p>
                        <p className="text-blue-800 dark:text-blue-200 text-sm">{currentQuestion.explanation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-6 py-3 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
            >
              Submit Test
              <CheckCircle2 className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!selectedAnswer}
              className="flex items-center gap-2 px-8 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
            >
              Next Question
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-8 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-700 p-6">
          <h3 className="text-sm font-bold text-slate-700 dark:text-gray-300 mb-4">Question Navigator</h3>
          <div className="grid grid-cols-10 gap-2">
            {testData.questions.map((q, index) => {
              const isAnswered = answers[index] !== undefined;
              const isCurrent = index === currentQuestionIndex;
              const isLocked = lockedQuestions.has(index);

              let navClass: string;
              if (isCurrent) {
                navClass = 'bg-blue-700 text-white';
              } else if (isLocked) {
                // Study mode: show correct/incorrect color
                const wasCorrect = normalizeAnswer(q.correctAnswer) === normalizeAnswer(answers[index] || '');
                navClass = wasCorrect
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-red-100 text-red-700 border border-red-300';
              } else if (isAnswered) {
                navClass = 'bg-emerald-100 text-emerald-700 border border-emerald-200';
              } else {
                navClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
              }

              return (
                <button
                  key={index}
                  onClick={() => {
                    // Save current answer before switching
                    if (selectedAnswer && !lockedQuestions.has(currentQuestionIndex)) {
                      setAnswers(prev => ({
                        ...prev,
                        [currentQuestionIndex]: selectedAnswer
                      }));
                    }
                    setCurrentQuestionIndex(index);
                    setSelectedAnswer(answers[index] || '');
                  }}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${navClass}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
