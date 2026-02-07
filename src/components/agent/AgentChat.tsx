'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string }>;
  images?: Array<{ url: string; caption: string }>;
  calculations?: Array<{
    step: number;
    description: string;
    formula?: string;
    result?: string;
  }>;
}

interface AgentChatProps {
  conversationId?: string | null;
}

export function AgentChat({ conversationId: initialConversationId }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load conversation history if conversationId provided
    if (initialConversationId) {
      loadConversation(initialConversationId);
    }
  }, [initialConversationId]);

  const loadConversation = async (convId: string) => {
    try {
      const response = await fetch(`/api/agent/chat?conversationId=${convId}`);
      const data = await response.json();

      if (data.success && data.conversation) {
        const formattedMessages: Message[] = data.conversation.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          sources: msg.metadata?.sources,
          images: msg.metadata?.images,
          calculations: msg.metadata?.calculations
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      if (data.success) {
        setConversationId(data.conversationId);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response.message,
          sources: data.response.sources,
          images: data.response.images,
          calculations: data.response.calculationSteps
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure Ollama is running and try again.'
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              NMLS Study Agent
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Ask me anything about mortgage lending, regulations, calculations, or exam topics.
              I'll provide step-by-step explanations with sources.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              <button
                onClick={() => setInput('Calculate the monthly payment for a $300,000 loan at 6.5% APR for 30 years')}
                className="p-3 text-left text-sm border border-gray-200 dark:border-neutral-700 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                💰 Calculate monthly payment
              </button>
              <button
                onClick={() => setInput('What are the key requirements of TILA-RESPA?')}
                className="p-3 text-left text-sm border border-gray-200 dark:border-neutral-700 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                📋 Explain TILA-RESPA
              </button>
              <button
                onClick={() => setInput('Show me an example of a Closing Disclosure form')}
                className="p-3 text-left text-sm border border-gray-200 dark:border-neutral-700 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                📄 View form examples
              </button>
              <button
                onClick={() => setInput('What is the difference between APR and interest rate?')}
                className="p-3 text-left text-sm border border-gray-200 dark:border-neutral-700 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                🤔 APR vs Interest Rate
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6 text-white" />
              </div>
            )}

            <div className={`flex-1 max-w-3xl ${msg.role === 'user' ? 'order-1' : ''}`}>
              <div className={`rounded-lg p-4 ${
                msg.role === 'user'
                  ? 'bg-indigo-500 text-white ml-auto max-w-lg'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {/* Calculation Steps */}
              {msg.calculations && msg.calculations.length > 0 && (
                <div className="mt-3 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📊</span>
                    <h4 className="font-semibold text-amber-900">Step-by-Step Solution:</h4>
                  </div>
                  {msg.calculations.map((calc, idx) => (
                    <div key={idx} className="mb-3 last:mb-0">
                      <p className="font-medium text-amber-800 mb-1">
                        Step {calc.step}:
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-200 mb-1">
                        {calc.description}
                      </p>
                      {calc.formula && (
                        <div className="mt-2 p-2 bg-white dark:bg-neutral-900 rounded border border-amber-200">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Formula:</p>
                          <code className="text-sm text-gray-900 dark:text-white">{calc.formula}</code>
                        </div>
                      )}
                      {calc.result && (
                        <p className="mt-2 text-sm font-semibold text-emerald-700">
                          ✓ Result: {calc.result}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📚</span>
                    <h4 className="text-sm font-semibold text-blue-900">Sources:</h4>
                  </div>
                  <div className="space-y-1">
                    {msg.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        → {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Images */}
              {msg.images && msg.images.length > 0 && (
                <div className="mt-3 space-y-3">
                  {msg.images.map((img, idx) => (
                    <div key={idx} className="border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.caption}
                        className="w-full h-auto"
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.currentTarget.src = `https://via.placeholder.com/800x400?text=${encodeURIComponent(img.caption)}`;
                        }}
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-300 p-2 bg-gray-50 dark:bg-neutral-950 border-t border-gray-200 dark:border-neutral-700">
                        {img.caption}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-neutral-9500 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="bg-gray-100 dark:bg-neutral-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-950">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a mortgage lending question..."
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows={1}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
