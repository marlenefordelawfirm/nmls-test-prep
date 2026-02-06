import { chat } from '@/lib/ai/ollama';
import { prisma } from '@/lib/db';

export interface AgentResponse {
  message: string;
  sources: Array<{
    title: string;
    url: string;
  }>;
  images?: Array<{
    url: string;
    caption: string;
  }>;
  calculationSteps?: Array<{
    step: number;
    description: string;
    formula?: string;
    result?: string;
  }>;
}

export class AIAgentService {
  /**
   * Main agent query handler
   */
  static async query(
    userId: string,
    conversationId: string,
    userMessage: string
  ): Promise<AgentResponse> {
    // Get conversation history
    const history = await this.getConversationHistory(conversationId);

    // Build system prompt with instructions for formatting
    const systemPrompt = this.buildSystemPrompt();

    // Generate response
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history,
      { role: 'user' as const, content: userMessage }
    ];

    const responseText = await chat(messages);

    // Parse response for sources, images, calculations
    const parsedResponse = this.parseResponse(responseText);

    // Save to database
    await this.saveMessage(conversationId, userId, userMessage, parsedResponse);

    return parsedResponse;
  }

  /**
   * Build system prompt with clear formatting instructions
   */
  private static buildSystemPrompt(): string {
    return `You are an expert NMLS (Nationwide Multistate Licensing System) exam preparation tutor. You help students understand mortgage lending concepts, regulations, and calculations.

CRITICAL FORMATTING RULES:

1. **For Math Questions:**
   - Always show step-by-step calculations
   - Format steps as:
     [STEP 1] Description of what we're doing
     [FORMULA] The formula (e.g., M = P[r(1+r)^n]/[(1+r)^n-1])
     [CALCULATION] Show the actual numbers
     [RESULT] The final answer
   - Example:
     [STEP 1] Calculate monthly interest rate
     [FORMULA] r = Annual Rate / 12
     [CALCULATION] r = 0.065 / 12 = 0.00542
     [RESULT] Monthly rate = 0.542%

2. **For Citations:**
   - ALWAYS provide sources with web links
   - Format as: [SOURCE: Title of Document](https://url.com)
   - Use real, authoritative sources like CFPB, HUD, FHFA, Investopedia
   - Example: [SOURCE: TILA-RESPA Rule Overview](https://www.consumerfinance.gov/rules-policy/regulations/1026/)

3. **For Visual Examples:**
   - When diagrams or forms would help, suggest them
   - Format as: [IMAGE: Description of what should be shown](search-term)
   - Example: [IMAGE: Sample Closing Disclosure Form](closing-disclosure-form-example)

4. **General Rules:**
   - Use clear, simple language
   - Break complex topics into digestible parts
   - Reference specific regulations (TILA, RESPA, TRID, etc.) when applicable
   - Be encouraging and supportive

Your goal is to help students pass the NMLS exam by providing accurate, well-cited, easy-to-understand explanations.`;
  }

  /**
   * Parse response to extract sources, calculations, images
   */
  private static parseResponse(responseText: string): AgentResponse {
    // Extract calculation steps [STEP N], [FORMULA], [CALCULATION], [RESULT]
    const calculationSteps = this.extractCalculationSteps(responseText);

    // Extract source citations [SOURCE: Title](URL)
    const sources = this.extractSources(responseText);

    // Extract image references [IMAGE: Caption](search-term)
    const images = this.extractImages(responseText);

    // Remove formatting markers from the display text
    let cleanMessage = responseText
      .replace(/\[STEP \d+\]/g, '')
      .replace(/\[FORMULA\]/g, '')
      .replace(/\[CALCULATION\]/g, '')
      .replace(/\[RESULT\]/g, '')
      .replace(/\[SOURCE:[^\]]+\]\([^)]+\)/g, '')
      .replace(/\[IMAGE:[^\]]+\]\([^)]+\)/g, '')
      .trim();

    return {
      message: cleanMessage,
      sources,
      images: images.length > 0 ? images : undefined,
      calculationSteps: calculationSteps.length > 0 ? calculationSteps : undefined
    };
  }

  /**
   * Extract calculation steps from response
   */
  private static extractCalculationSteps(text: string) {
    const steps: Array<{
      step: number;
      description: string;
      formula?: string;
      result?: string;
    }> = [];

    // Match [STEP N] sections
    const stepRegex = /\[STEP (\d+)\]\s*([^\[]+?)(?=\[(?:STEP|FORMULA|SOURCE|IMAGE)|$)/gi;

    let stepMatch;
    let stepNum = 0;

    while ((stepMatch = stepRegex.exec(text)) !== null) {
      stepNum = parseInt(stepMatch[1]);
      const description = stepMatch[2].trim();

      // Look for formula, calculation, and result near this step
      const stepStart = stepMatch.index || 0;
      const nextStepMatch = text.substring(stepStart + 1).match(/\[STEP \d+\]/);
      const stepEnd = nextStepMatch && nextStepMatch.index !== undefined
        ? stepStart + 1 + nextStepMatch.index
        : text.length;
      const stepSection = text.substring(stepStart, stepEnd);

      const formulaMatch = /\[FORMULA\]\s*([^\[]+)/i.exec(stepSection);
      const resultMatch = /\[RESULT\]\s*([^\[]+)/i.exec(stepSection);

      steps.push({
        step: stepNum,
        description,
        formula: formulaMatch?.[1].trim(),
        result: resultMatch?.[1].trim()
      });
    }

    return steps;
  }

  /**
   * Extract sources from markdown citations [SOURCE: Title](URL)
   */
  private static extractSources(text: string) {
    const sources: Array<{ title: string; url: string }> = [];
    const sourceRegex = /\[SOURCE:\s*([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = sourceRegex.exec(text)) !== null) {
      sources.push({
        title: match[1].trim(),
        url: match[2].trim()
      });
    }

    return sources;
  }

  /**
   * Extract image references [IMAGE: Caption](search-term)
   */
  private static extractImages(text: string) {
    const images: Array<{ url: string; caption: string }> = [];
    const imageRegex = /\[IMAGE:\s*([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = imageRegex.exec(text)) !== null) {
      const caption = match[1].trim();
      const searchTerm = match[2].trim();

      // For MVP, we'll use Unsplash as a placeholder
      // In production, use Google Custom Search API or similar
      const imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(searchTerm)}`;

      images.push({
        caption,
        url: imageUrl
      });
    }

    return images;
  }

  /**
   * Get conversation history
   */
  private static async getConversationHistory(conversationId: string) {
    const messages = await prisma.agentMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 10 // Last 10 messages for context
    });

    return messages.map(m => ({
      role: (m.role === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content
    }));
  }

  /**
   * Save message to database
   */
  private static async saveMessage(
    conversationId: string,
    userId: string,
    userMessage: string,
    response: AgentResponse
  ) {
    await prisma.agentMessage.createMany({
      data: [
        {
          conversationId,
          role: 'USER',
          content: userMessage
        },
        {
          conversationId,
          role: 'ASSISTANT',
          content: response.message,
          toolResults: {
            sources: response.sources,
            images: response.images,
            calculations: response.calculationSteps
          } as any
        }
      ]
    });
  }

  /**
   * Create a new conversation
   */
  static async createConversation(
    userId: string,
    title: string
  ): Promise<string> {
    const conversation = await prisma.agentConversation.create({
      data: {
        userId,
        title: title.slice(0, 100) // Limit title length
      }
    });

    return conversation.id;
  }

  /**
   * Get user's conversations
   */
  static async getUserConversations(userId: string) {
    return await prisma.agentConversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }
}
