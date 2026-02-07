'use client';

import { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  MessageCircle,
  FileText,
  Video,
  Keyboard,
  BookOpen,
  Target,
  TrendingUp,
  PlayCircle
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function HelpPage() {
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: '1',
      category: 'Getting Started',
      question: 'How do I start preparing for the NMLS exam?',
      answer: 'Begin by taking a practice test to assess your current knowledge level. Then review your analytics to identify weak areas, and use the AI Study Agent to get personalized study recommendations. We recommend studying 1-2 hours daily for consistent progress.'
    },
    {
      id: '2',
      category: 'Getting Started',
      question: 'What is the difference between Practice Tests and Full Exams?',
      answer: 'Practice Tests are shorter, focused tests on specific content areas (20-30 questions) that help you master individual topics. Full Exams simulate the actual NMLS test with 125 questions covering all content areas, helping you prepare for the real exam experience.'
    },
    {
      id: '3',
      category: 'Practice Tests',
      question: 'How many practice tests should I take?',
      answer: 'We recommend taking at least 10-15 practice tests before attempting full exam simulations. Focus on achieving consistent scores above 85% on practice tests in all content areas before moving to full exams.'
    },
    {
      id: '4',
      category: 'Practice Tests',
      question: 'Can I review my answers after completing a test?',
      answer: 'Yes! After completing any test, you will see a detailed review page showing all questions, your answers, correct answers, and comprehensive explanations. You can also access your test history in the Analytics page.'
    },
    {
      id: '5',
      category: 'Analytics',
      question: 'How is my performance tracked?',
      answer: 'Your performance is tracked across multiple dimensions: overall scores, performance by content area, accuracy on specific subtopics, study time, and test completion rates. All this data is visualized in your Analytics dashboard to help you identify patterns and areas for improvement.'
    },
    {
      id: '6',
      category: 'Analytics',
      question: 'What do the colored scores mean?',
      answer: 'Green (75%+) indicates strong performance, Yellow/Amber (60-74%) shows areas needing improvement, and Red (<60%) highlights weak areas requiring focused study. The actual NMLS exam requires a minimum score of 75% to pass.'
    },
    {
      id: '7',
      category: 'AI Study Agent',
      question: 'How does the AI Study Agent work?',
      answer: 'The AI Study Agent analyzes your performance data and provides personalized study recommendations, explains complex concepts, answers questions about NMLS topics, and helps you create custom study plans based on your strengths and weaknesses.'
    },
    {
      id: '8',
      category: 'Technical',
      question: 'Can I use the platform on mobile devices?',
      answer: 'Yes! Our platform is fully responsive and works on all devices including smartphones, tablets, and desktop computers. Your progress syncs automatically across all devices.'
    },
    {
      id: '9',
      category: 'Technical',
      question: 'What browsers are supported?',
      answer: 'We support all modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using the latest version of your preferred browser.'
    },
    {
      id: '10',
      category: 'Account',
      question: 'How do I change my notification settings?',
      answer: 'Go to Settings > Notifications to customize your email notifications, study reminders, achievement alerts, and weekly progress reports. You can toggle each notification type on or off based on your preferences.'
    }
  ];

  const keyboardShortcuts = [
    { keys: 'Arrow Keys', description: 'Navigate between answers' },
    { keys: 'Enter', description: 'Submit answer' },
    { keys: 'N', description: 'Next question (after submitting)' },
    { keys: 'R', description: 'Review mode (after test completion)' },
    { keys: 'Esc', description: 'Close modal dialogs' },
    { keys: '/', description: 'Focus search (coming soon)' }
  ];

  const gettingStartedSteps = [
    {
      icon: Target,
      title: 'Take a Diagnostic Test',
      description: 'Start with a practice test to assess your baseline knowledge across all NMLS content areas.'
    },
    {
      icon: TrendingUp,
      title: 'Review Your Analytics',
      description: 'Identify your strengths and weaknesses using the comprehensive analytics dashboard.'
    },
    {
      icon: BookOpen,
      title: 'Focused Study',
      description: 'Use practice tests to improve weak areas and reinforce strong areas with targeted practice.'
    },
    {
      icon: PlayCircle,
      title: 'Full Exam Simulation',
      description: 'Once consistently scoring 85%+, take full exam simulations to build test-taking stamina.'
    }
  ];

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const groupedFAQs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQItem[]>);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-8 border-l-4 border-l-blue-700">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="w-8 h-8 text-blue-700" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white dark:text-white">
              Help Center
            </h1>
          </div>
          <p className="text-slate-600 dark:text-gray-400 dark:text-gray-400">
            Everything you need to succeed with your NMLS exam preparation
          </p>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-slate-200 dark:border-neutral-700 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-6">
            <PlayCircle className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">Getting Started</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {gettingStartedSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  <div className="bg-slate-50 dark:bg-neutral-800 dark:bg-neutral-800 rounded-xl p-4 border border-slate-200 dark:border-neutral-700 dark:border-neutral-700 h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-bold text-blue-700">Step {index + 1}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-gray-400 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-slate-200 dark:border-neutral-700 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
              <div key={category}>
                <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryFAQs.map((faq) => (
                    <div
                      key={faq.id}
                      className="border border-slate-200 dark:border-neutral-700 dark:border-neutral-700 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-neutral-800 dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <span className="text-sm font-medium text-slate-900 dark:text-white dark:text-white text-left">
                          {faq.question}
                        </span>
                        {openFAQ === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-blue-700 flex-shrink-0 ml-2" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 ml-2" />
                        )}
                      </button>
                      {openFAQ === faq.id && (
                        <div className="px-4 py-3 bg-white dark:bg-neutral-900 border-t border-slate-200 dark:border-neutral-700 dark:border-neutral-700">
                          <p className="text-sm text-slate-600 dark:text-gray-400 dark:text-gray-400">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-slate-200 dark:border-neutral-700 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-6">
            <Keyboard className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">Keyboard Shortcuts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {keyboardShortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-neutral-800 dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700 dark:border-neutral-700"
              >
                <span className="text-sm text-slate-600 dark:text-gray-400 dark:text-gray-400">
                  {shortcut.description}
                </span>
                <kbd className="px-2 py-1 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-slate-600 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-white dark:text-white">
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Video Tutorials */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-slate-200 dark:border-neutral-700 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-6">
            <Video className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">Video Tutorials</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-neutral-800 dark:bg-neutral-800 rounded-lg p-4 border border-slate-200 dark:border-neutral-700 dark:border-neutral-700">
              <div className="w-full aspect-video bg-slate-200 dark:bg-neutral-700 dark:bg-neutral-700 rounded-lg mb-3 flex items-center justify-center">
                <PlayCircle className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white dark:text-white mb-1">
                Platform Overview
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 dark:text-gray-400">
                Learn the basics of navigating the NMLS Test Prep platform
              </p>
              <span className="text-xs text-blue-700 font-medium">Coming Soon</span>
            </div>

            <div className="bg-slate-50 dark:bg-neutral-800 dark:bg-neutral-800 rounded-lg p-4 border border-slate-200 dark:border-neutral-700 dark:border-neutral-700">
              <div className="w-full aspect-video bg-slate-200 dark:bg-neutral-700 dark:bg-neutral-700 rounded-lg mb-3 flex items-center justify-center">
                <PlayCircle className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white dark:text-white mb-1">
                Using Analytics
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 dark:text-gray-400">
                Understand your performance data and improve strategically
              </p>
              <span className="text-xs text-blue-700 font-medium">Coming Soon</span>
            </div>

            <div className="bg-slate-50 dark:bg-neutral-800 dark:bg-neutral-800 rounded-lg p-4 border border-slate-200 dark:border-neutral-700 dark:border-neutral-700">
              <div className="w-full aspect-video bg-slate-200 dark:bg-neutral-700 dark:bg-neutral-700 rounded-lg mb-3 flex items-center justify-center">
                <PlayCircle className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white dark:text-white mb-1">
                AI Study Agent
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 dark:text-gray-400">
                Get personalized help from your AI study assistant
              </p>
              <span className="text-xs text-blue-700 font-medium">Coming Soon</span>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-slate-200 dark:border-neutral-700 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">Contact Support</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <Mail className="w-8 h-8 text-blue-700 mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white dark:text-white mb-2">
                Email Support
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 dark:text-gray-400 mb-3">
                Get help via email. We typically respond within 24 hours.
              </p>
              <a
                href="mailto:support@nmlstestprep.com"
                className="inline-block px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors"
              >
                support@nmlstestprep.com
              </a>
            </div>

            <div className="bg-indigo-50 dark:bg-blue-900/20 rounded-lg p-6 border border-indigo-200 dark:border-blue-800">
              <FileText className="w-8 h-8 text-indigo-700 mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white dark:text-white mb-2">
                Documentation
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 dark:text-gray-400 mb-3">
                Browse our comprehensive documentation for detailed guides.
              </p>
              <button
                disabled
                className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-sm font-medium transition-colors cursor-not-allowed"
              >
                View Docs (Coming Soon)
              </button>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <BookOpen className="w-6 h-6 text-blue-700 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white mb-2">
                Need More Help?
              </h3>
              <p className="text-sm text-slate-600 dark:text-gray-400 dark:text-gray-400 mb-4">
                If you cannot find the answer you are looking for, please do not hesitate to reach out to our support team. We are here to help you succeed on your NMLS exam!
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Target className="w-4 h-4" />
                  Back to Dashboard
                </a>
                <a
                  href="/practice"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-900 dark:text-white dark:text-white border border-slate-300 dark:border-slate-600 dark:border-slate-600 rounded-lg text-sm font-medium transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  Start Practicing
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
