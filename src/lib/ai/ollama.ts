/**
 * AI Client - Supports both Ollama (dev) and OpenAI (production)
 * Set AI_PROVIDER=openai in .env to use OpenAI API
 */

import OpenAI from 'openai';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'; // Default to OpenAI for production
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * Send chat messages and get response
 * Uses OpenAI in production, Ollama in development
 */
export async function chat(
  messages: ChatMessage[],
  model?: string
): Promise<string> {
  if (AI_PROVIDER === 'openai') {
    return chatOpenAI(messages, model || 'gpt-4o-mini');
  }
  return chatOllama(messages, model || 'deepseek-r1:latest');
}

/**
 * OpenAI implementation (production)
 */
async function chatOpenAI(
  messages: ChatMessage[],
  model: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI chat error:', error);
    throw new Error('Failed to get AI response');
  }
}

/**
 * Ollama implementation (development)
 */
async function chatOllama(
  messages: ChatMessage[],
  model: string
): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message?.content || '';
  } catch (error) {
    console.error('Ollama chat error:', error);
    throw new Error('Failed to get AI response');
  }
}

/**
 * Create embeddings for text (for RAG/vector search)
 */
export async function createEmbedding(text: string): Promise<number[]> {
  if (AI_PROVIDER === 'openai') {
    return createEmbeddingOpenAI(text);
  }
  return createEmbeddingOllama(text);
}

async function createEmbeddingOpenAI(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('OpenAI embedding error:', error);
    throw new Error('Failed to create embedding');
  }
}

async function createEmbeddingOllama(text: string): Promise<number[]> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama embedding error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error('Embedding error:', error);
    throw new Error('Failed to create embedding');
  }
}

/**
 * Stream chat responses for real-time UI updates
 */
export async function streamChat(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  model?: string
): Promise<void> {
  if (AI_PROVIDER === 'openai') {
    return streamChatOpenAI(messages, onChunk, model || 'gpt-4o-mini');
  }
  return streamChatOllama(messages, onChunk, model || 'deepseek-r1:latest');
}

async function streamChatOpenAI(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  model: string
): Promise<void> {
  try {
    const stream = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        onChunk(content);
      }
    }
  } catch (error) {
    console.error('OpenAI streaming error:', error);
    throw new Error('Failed to stream response');
  }
}

async function streamChatOllama(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  model: string
): Promise<void> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.message?.content) {
            onChunk(json.message.content);
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      }
    }
  } catch (error) {
    console.error('Streaming error:', error);
    throw new Error('Failed to stream response');
  }
}
