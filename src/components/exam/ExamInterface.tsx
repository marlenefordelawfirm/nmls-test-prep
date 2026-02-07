'use client';

import { useState, useEffect } from 'react';
import { Clock, Grid3x3, ChevronLeft, ChevronRight, Flag, CheckCircle, Pause, Play } from 'lucide-react';
import { Question, ContentArea, SubTopic } from '@prisma/client';

interface QuestionWithRelations extends Question {
  contentArea: ContentArea;
  subTopic: SubTopic;
}

interface ExamInterfaceProps {
  questions: QuestionWithRelations[];
  userId: string;
}

export function ExamInterface({ questions, userId }: ExamInterfaceProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [showNavigator, setShowNavigator] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(190 * 60); // 190 minutes in seconds
  const [examStarted, setExamStarted] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [questionTimeSpent, setQuestionTimeSpent] = useState<Record<number, number>>({}); // Time per question in seconds
  const [currentQuestionTime, setCurrentQuestionTime] = useState(0); // Current question timer

  // Countdown timer for overall exam
  useEffect(() => {
    if (!examStarted || timeRemaining <= 0 || isPaused) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, timeRemaining, isPaused]);

  // Per-question timer
  useEffect(() => {
    if (!examStarted || isPaused) return;

    const timer = setInterval(() => {
      setCurrentQuestionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, currentQuestion, isPaused]);

  // Save question time when moving to next question
  useEffect(() => {
    // Reset timer when question changes
    return () => {
      if (currentQuestionTime > 0) {
        setQuestionTimeSpent(prev => ({
          ...prev,
          [currentQuestion]: (prev[currentQuestion] || 0) + currentQuestionTime
        }));
      }
    };
  }, [currentQuestion]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get time warning level
  const getTimeWarningLevel = () => {
    const minutes = Math.floor(timeRemaining / 60);
    if (minutes <= 5) return 'critical';
    if (minutes <= 10) return 'warning';
    if (minutes <= 30) return 'caution';
    return 'normal';
  };

  const handleAnswer = (answerId: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: answerId }));
  };

  const handleNavigateQuestion = (newIndex: number) => {
    // Save current question time before navigating
    setQuestionTimeSpent(prev => ({
      ...prev,
      [currentQuestion]: (prev[currentQuestion] || 0) + currentQuestionTime
    }));
    setCurrentQuestion(newIndex);
    setCurrentQuestionTime(0);
    setShowNavigator(false);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const toggleFlag = () => {
    setFlagged(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion);
      } else {
        newSet.add(currentQuestion);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    try {
      // Save final question time
      const finalQuestionTimeSpent = {
        ...questionTimeSpent,
        [currentQuestion]: (questionTimeSpent[currentQuestion] || 0) + currentQuestionTime
      };

      // Calculate total time spent
      const totalTimeSpent = (190 * 60) - timeRemaining;

      // Format answers with time spent per question
      const answersWithTime = questions.map((q, index) => ({
        questionIndex: index,
        questionId: q.id,
        selectedAnswer: answers[index] || '',
        timeSpent: finalQuestionTimeSpent[index] || 0
      }));

      // Submit to API
      const response = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          timeSpent: totalTimeSpent,
          answersWithTime
        })
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to results page
        window.location.href = `/exam/results/${data.resultId}`;
      } else {
        alert('Failed to submit exam. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Failed to submit exam. Please try again.');
    }
  };

  const question = questions[currentQuestion];
  const timeWarning = getTimeWarningLevel();
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  if (!examStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-6">
        <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border-l-4 border-l-blue-700 p-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            NMLS National Exam Simulation
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Complete the full 125-question exam to test your readiness for the NMLS National Test.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Questions</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">125</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Time Limit</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">190 min</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Passing Score</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">75%</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 mb-8">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Important Notes
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-700 font-bold">•</span>
                You can pause the exam at any time using the Pause button
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-700 font-bold">•</span>
                Flag questions for review using the flag icon
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-700 font-bold">•</span>
                Navigate between questions using the question navigator
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-700 font-bold">•</span>
                Time warnings appear at 30, 10, and 5 minutes remaining
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-700 font-bold">•</span>
                The exam will auto-submit when time expires
              </li>
            </ul>
          </div>

          <button
            onClick={() => setExamStarted(true)}
            className="w-full py-4 bg-blue-700 text-white rounded-xl hover:bg-blue-800 font-bold text-lg transition-all shadow-sm"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col">
      {/* Pause Overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-8 max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Pause className="w-8 h-8 text-blue-700" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Exam Paused</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Your timer is paused. Click Resume when you're ready to continue.
              </p>
              <button
                onClick={togglePause}
                className="w-full py-3 bg-blue-700 text-white rounded-xl hover:bg-blue-800 font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Play className="w-5 h-5" />
                Resume Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 sticky top-0 z-10 shadow-sm">
        {/* Main Header Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Question {currentQuestion + 1} of {questions.length}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">{question.contentArea.name}</p>
            </div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              <span className="font-bold text-slate-900 dark:text-white">{answeredCount}</span> / {questions.length} answered
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Current Question Timer */}
            <div className="h-10 flex items-center gap-2 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                {formatTime(currentQuestionTime)}
              </span>
            </div>

            {/* Total Exam Timer */}
            <div className={`h-10 flex items-center gap-2 px-4 rounded-xl border font-mono text-sm font-bold ${timeWarning === 'critical' ? 'bg-red-50 text-red-700 border-red-200' :
              timeWarning === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                timeWarning === 'caution' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  'bg-slate-50 text-slate-900 border-slate-200'
              }`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeRemaining)}
            </div>

            {/* Pause Button */}
            <button
              onClick={togglePause}
              className="h-10 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl flex items-center gap-2 transition-all font-bold text-sm border border-slate-200 dark:border-slate-700"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>

            {/* Navigator Toggle */}
            <button
              onClick={() => setShowNavigator(!showNavigator)}
              className="h-10 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl flex items-center gap-2 transition-all font-bold text-sm shadow-sm"
            >
              <Grid3x3 className="w-4 h-4" />
              Navigator
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className="bg-blue-700 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Question Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Question */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                      {question.subTopic.name}
                    </span>
                    {flagged.has(currentQuestion) && (
                      <span className="px-4 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100 flex items-center gap-2">
                        <Flag className="w-3 h-3" />
                        Flagged
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-slate-900 dark:text-white leading-relaxed">
                    {question.questionText}
                  </p>
                </div>
                <button
                  onClick={toggleFlag}
                  className={`ml-4 w-10 h-10 rounded-xl transition-all border flex items-center justify-center ${flagged.has(currentQuestion)
                    ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200'
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-800 border-slate-200'
                    }`}
                  title="Flag for review"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {[
                  { id: question.optionA, text: question.optionA, label: 'A' },
                  { id: question.optionB, text: question.optionB, label: 'B' },
                  { id: question.optionC, text: question.optionC, label: 'C' },
                  { id: question.optionD, text: question.optionD, label: 'D' }
                ].map((option) => (
                  <label
                    key={option.id}
                    className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${answers[currentQuestion] === option.id
                      ? 'border-blue-700 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={option.id}
                        checked={answers[currentQuestion] === option.id}
                        onChange={() => handleAnswer(option.id)}
                        className="mt-1 w-4 h-4 text-blue-700"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300 mr-2">{option.label}.</span>
                        <span className="text-slate-900">{option.text}</span>
                      </div>
                      {answers[currentQuestion] === option.id && (
                        <CheckCircle className="w-5 h-5 text-blue-700 flex-shrink-0" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center gap-2 transition-all font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-sm text-sm"
                >
                  Submit Exam
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                  className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl flex items-center gap-2 transition-all font-bold shadow-sm text-sm"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        {showNavigator && (
          <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 p-6 overflow-y-auto">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 text-base">Question Navigator</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleNavigateQuestion(idx)}
                  className={`w-12 h-12 rounded-xl font-bold text-sm transition-all border ${idx === currentQuestion
                    ? 'bg-blue-700 text-white border-blue-700'
                    : answers[idx]
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : flagged.has(idx)
                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800'
                    }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-emerald-50 border-2 border-emerald-200 rounded"></div>
                <span className="text-slate-600 dark:text-slate-400 font-bold text-xs">Answered</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-amber-50 border-2 border-amber-200 rounded"></div>
                <span className="text-slate-600 dark:text-slate-400 font-bold text-xs">Flagged</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded"></div>
                <span className="text-slate-600 dark:text-slate-400 font-bold text-xs">Not answered</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Submit Exam?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You have answered <span className="font-bold text-slate-900 dark:text-white">{answeredCount}</span> out of <span className="font-bold text-slate-900">{questions.length}</span> questions.
              {answeredCount < questions.length && (
                <span className="block mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 font-medium text-sm">
                  ⚠️ Warning: {questions.length - answeredCount} questions remain unanswered.
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all font-bold text-slate-900 dark:text-white border border-slate-200"
              >
                Continue Exam
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all font-bold shadow-sm"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
