import { Metadata } from 'next';
import { AgentChat } from '@/components/agent/AgentChat';

export const metadata: Metadata = {
  title: 'AI Study Agent - NMLS Test Prep',
  description: 'Get help from your AI study agent for NMLS exam preparation'
};

export default function AgentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Study Agent
        </h1>
        <p className="text-gray-600">
          Ask questions about mortgage lending, regulations, calculations, and exam topics.
          Your AI tutor provides step-by-step explanations with sources.
        </p>
      </div>

      <AgentChat />
    </div>
  );
}
