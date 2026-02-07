'use client';

import { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';

interface ContentArea {
  id: string;
  name: string;
  _count: {
    questions: number;
  };
}

interface Question {
  id: string;
  questionText: string;
  difficulty: string;
  approvalStatus: string;
  createdBy: string;
  subTopic: {
    name: string;
  };
}

interface QuestionsByArea {
  [areaId: string]: Question[];
}

export default function KnowledgeBasePage() {
  const [contentAreas, setContentAreas] = useState<ContentArea[]>([]);
  const [questions, setQuestions] = useState<QuestionsByArea>({});
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingQuestion, setUpdatingQuestion] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/questions');
      const data = await response.json();

      if (data.success) {
        setContentAreas(data.contentAreas);
        setQuestions(data.questionsByArea);
      } else {
        setError(data.error || 'Failed to fetch questions');
      }
    } catch (err) {
      setError('Network error fetching questions');
    } finally {
      setLoading(false);
    }
  };

  const toggleArea = (areaId: string) => {
    const newExpanded = new Set(expandedAreas);
    if (newExpanded.has(areaId)) {
      newExpanded.delete(areaId);
    } else {
      newExpanded.add(areaId);
    }
    setExpandedAreas(newExpanded);
  };

  const updateQuestionStatus = async (questionId: string, newStatus: string) => {
    setUpdatingQuestion(questionId);
    setError(null);
    try {
      const response = await fetch('/api/admin/questions/update-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, approvalStatus: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setQuestions((prev) => {
          const newQuestions = { ...prev };
          Object.keys(newQuestions).forEach((areaId) => {
            newQuestions[areaId] = newQuestions[areaId].map((q) =>
              q.id === questionId ? { ...q, approvalStatus: newStatus } : q
            );
          });
          return newQuestions;
        });
      } else {
        setError(data.error || 'Failed to update question status');
      }
    } catch (err) {
      setError('Network error updating question');
    } finally {
      setUpdatingQuestion(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Visible
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Hidden
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'MEDIUM':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'HARD':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-8 border-l-4 border-l-blue-700">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-700 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  const totalQuestions = Object.values(questions).reduce((sum, qs) => sum + qs.length, 0);
  const approvedQuestions = Object.values(questions)
    .flat()
    .filter((q) => q.approvalStatus === 'APPROVED').length;
  const pendingQuestions = Object.values(questions)
    .flat()
    .filter((q) => q.approvalStatus === 'PENDING').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-8 border-l-4 border-l-blue-700">
        <AdminBreadcrumb items={[{ label: 'Question Bank' }]} />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-700" />
              Question Bank
            </h1>
            <p className="text-slate-600">
              Manage questions by category and control their visibility in tests
            </p>
          </div>
          <button
            onClick={fetchData}
            className="h-10 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl flex items-center gap-2 transition-all font-bold text-sm shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-neutral-800 p-6 rounded-xl border border-slate-100 dark:border-neutral-700 dark:border-neutral-700">
          <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">
            Total Questions
          </p>
          <p className="text-3xl font-bold text-slate-900">{totalQuestions}</p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            Visible (Approved)
          </p>
          <p className="text-3xl font-bold text-emerald-700">{approvedQuestions}</p>
        </div>
        <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            Pending Review
          </p>
          <p className="text-3xl font-bold text-amber-700">{pendingQuestions}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-xl border border-red-100">
          <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
            Hidden (Rejected)
          </p>
          <p className="text-3xl font-bold text-red-700">
            {totalQuestions - approvedQuestions - pendingQuestions}
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-blue-900 mb-1">About Question Visibility</p>
            <p className="text-sm text-blue-700">
              Only questions marked as <strong>Visible (APPROVED)</strong> will appear in practice tests and full exams.
              Use <strong>Hidden (REJECTED)</strong> to remove questions from user tests without deleting them.
              <strong> Pending</strong> questions are awaiting review.
            </p>
          </div>
        </div>
      </div>

      {/* Content Areas and Questions */}
      <div className="space-y-4">
        {contentAreas.map((area) => {
          const areaQuestions = questions[area.id] || [];
          const isExpanded = expandedAreas.has(area.id);

          return (
            <div key={area.id} className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200">
              {/* Area Header */}
              <button
                onClick={() => toggleArea(area.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-neutral-700 dark:bg-neutral-800 transition-colors rounded-xl"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  )}
                  <h3 className="text-lg font-bold text-slate-900">{area.name}</h3>
                </div>
                <span className="px-3 py-1 bg-slate-100 dark:bg-neutral-800 dark:bg-neutral-800 text-slate-700 dark:text-gray-300 text-sm font-bold rounded-full">
                  {areaQuestions.length} Questions
                </span>
              </button>

              {/* Questions List */}
              {isExpanded && (
                <div className="border-t border-slate-200">
                  {areaQuestions.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {areaQuestions.map((question) => (
                        <div key={question.id} className="p-6 hover:bg-slate-50 dark:hover:bg-neutral-700 dark:bg-neutral-800 transition-colors">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <p className="text-sm text-slate-900 dark:text-white mb-3 line-clamp-2">
                                {question.questionText}
                              </p>
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`px-2 py-1 text-xs font-bold rounded border ${getDifficultyColor(
                                    question.difficulty
                                  )}`}
                                >
                                  {question.difficulty}
                                </span>
                                <span className="px-2 py-1 bg-slate-50 dark:bg-neutral-800 text-slate-600 dark:text-gray-400 text-xs font-medium rounded border border-slate-200">
                                  {question.subTopic.name}
                                </span>
                                <span className="px-2 py-1 bg-slate-50 dark:bg-neutral-800 text-slate-600 dark:text-gray-400 text-xs font-medium rounded border border-slate-200">
                                  {question.createdBy}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {getStatusBadge(question.approvalStatus)}
                              <div className="flex gap-1">
                                {question.approvalStatus !== 'APPROVED' && (
                                  <button
                                    onClick={() => updateQuestionStatus(question.id, 'APPROVED')}
                                    disabled={updatingQuestion === question.id}
                                    className="h-9 w-9 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-700 rounded-lg flex items-center justify-center transition-all border border-emerald-200"
                                    title="Make Visible"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                )}
                                {question.approvalStatus !== 'REJECTED' && (
                                  <button
                                    onClick={() => updateQuestionStatus(question.id, 'REJECTED')}
                                    disabled={updatingQuestion === question.id}
                                    className="h-9 w-9 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-700 rounded-lg flex items-center justify-center transition-all border border-red-200"
                                    title="Hide"
                                  >
                                    <EyeOff className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-600">No questions in this category</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
