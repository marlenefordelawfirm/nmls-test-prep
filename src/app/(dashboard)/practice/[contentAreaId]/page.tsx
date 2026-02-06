'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, X, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface Question {
  id: string;
  questionNumber: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
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

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleExit}
                className="text-slate-600 hover:text-slate-900 transition-colors"
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

            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-bold">{formatTime(timer)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-700 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Question Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
          {/* Question */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                {currentQuestion.difficulty}
              </span>
              <span className="text-xs text-slate-500">{currentQuestion.subTopic}</span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 leading-relaxed">
              {currentQuestion.questionText}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map((option) => {
              const optionText = currentQuestion[`option${option}` as keyof Question] as string;
              const isSelected = selectedAnswer === option;

              return (
                <label
                  key={option}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-700 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={isSelected}
                    onChange={() => handleAnswerSelect(option)}
                    className="mt-1 w-5 h-5 text-blue-700 focus:ring-2 focus:ring-blue-700"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">{option}.</span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-700" />}
                    </div>
                    <p className="text-slate-700 leading-relaxed">{optionText}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-6 py-3 text-slate-700 hover:text-slate-900 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Question Navigator</h3>
          <div className="grid grid-cols-10 gap-2">
            {testData.questions.map((_, index) => {
              const isAnswered = answers[index] !== undefined;
              const isCurrent = index === currentQuestionIndex;

              return (
                <button
                  key={index}
                  onClick={() => {
                    // Save current answer before switching
                    if (selectedAnswer) {
                      setAnswers(prev => ({
                        ...prev,
                        [currentQuestionIndex]: selectedAnswer
                      }));
                    }
                    setCurrentQuestionIndex(index);
                    setSelectedAnswer(answers[index] || '');
                  }}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                    isCurrent
                      ? 'bg-blue-700 text-white'
                      : isAnswered
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
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
