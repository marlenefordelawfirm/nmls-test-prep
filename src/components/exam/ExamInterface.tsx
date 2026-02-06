'use client';

import { useState, useEffect } from 'react';
import { Clock, Grid3x3, ChevronLeft, ChevronRight, Flag, CheckCircle } from 'lucide-react';
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

  // Countdown timer
  useEffect(() => {
    if (!examStarted || timeRemaining <= 0) return;

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
  }, [examStarted, timeRemaining]);

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
      // Calculate time spent
      const timeSpent = (190 * 60) - timeRemaining;

      // Submit to API
      const response = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, timeSpent })
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            NMLS National Exam Simulation
          </h1>
          <div className="space-y-4 text-gray-700 mb-8">
            <p>
              <strong>Total Questions:</strong> 125
            </p>
            <p>
              <strong>Time Limit:</strong> 190 minutes (3 hours 10 minutes)
            </p>
            <p>
              <strong>Passing Score:</strong> 75% (94 correct answers)
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4">
              <h3 className="font-semibold text-blue-900 mb-2">Important Notes:</h3>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>You can flag questions for review</li>
                <li>Navigate between questions using the question navigator</li>
                <li>You'll receive warnings at 30, 10, and 5 minutes remaining</li>
                <li>The exam will auto-submit when time expires</li>
              </ul>
            </div>
          </div>
          <button
            onClick={() => setExamStarted(true)}
            className="w-full py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-lg transition-colors"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Question {currentQuestion + 1} of {questions.length}</h2>
              <p className="text-xs text-gray-400">{question.contentArea.name}</p>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{answeredCount}</span> / {questions.length} answered
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold ${
              timeWarning === 'critical' ? 'bg-red-100 text-red-700' :
              timeWarning === 'warning' ? 'bg-amber-100 text-amber-700' :
              timeWarning === 'caution' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeRemaining)}
            </div>

            {/* Navigator Toggle */}
            <button
              onClick={() => setShowNavigator(!showNavigator)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Grid3x3 className="w-5 h-5" />
              Navigator
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Question Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Question */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                      {question.subTopic.name}
                    </span>
                    {flagged.has(currentQuestion) && (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1">
                        <Flag className="w-3 h-3" />
                        Flagged
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-gray-900 leading-relaxed">
                    {question.questionText}
                  </p>
                </div>
                <button
                  onClick={toggleFlag}
                  className={`ml-4 p-2 rounded-lg transition-colors ${
                    flagged.has(currentQuestion)
                      ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                  title="Flag for review"
                >
                  <Flag className="w-5 h-5" />
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
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      answers[currentQuestion] === option.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={option.id}
                        checked={answers[currentQuestion] === option.id}
                        onChange={() => handleAnswer(option.id)}
                        className="mt-1 w-4 h-4 text-indigo-600"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-gray-700 mr-2">{option.label}.</span>
                        <span className="text-gray-900">{option.text}</span>
                      </div>
                      {answers[currentQuestion] === option.id && (
                        <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
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
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center gap-2 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Submit Exam
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        {showNavigator && (
          <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Question Navigator</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`w-12 h-12 rounded-lg font-semibold text-sm transition-all ${
                    idx === currentQuestion
                      ? 'bg-indigo-600 text-white'
                      : answers[idx]
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : flagged.has(idx)
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <span className="text-gray-600">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-100 rounded"></div>
                <span className="text-gray-600">Flagged</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span className="text-gray-600">Not answered</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Submit Exam?</h3>
            <p className="text-gray-600 mb-6">
              You have answered {answeredCount} out of {questions.length} questions.
              {answeredCount < questions.length && (
                <span className="block mt-2 text-amber-600 font-medium">
                  Warning: {questions.length - answeredCount} questions remain unanswered.
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Continue Exam
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
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
