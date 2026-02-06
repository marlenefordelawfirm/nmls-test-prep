import { readFile } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/db';
import { chat } from '@/lib/ai/ollama';

/**
 * Service for processing study materials into structured knowledge base
 * and generating questions without constant API calls
 */
export class KnowledgeBaseService {
  private static readonly STUDY_MATERIALS_PATH = path.join(process.cwd(), 'data', 'extracted-content');

  /**
   * Parse study material into structured topics
   */
  static async parseStudyMaterial(filePath: string): Promise<Array<{
    topic: string;
    content: string;
    contentAreaId: string;
    subTopicId?: string;
  }>> {
    const fullPath = path.join(this.STUDY_MATERIALS_PATH, filePath);
    const content = await readFile(fullPath, 'utf-8');

    // Parse content into sections
    const sections: Array<{
      topic: string;
      content: string;
      contentAreaId: string;
      subTopicId?: string;
    }> = [];

    // Split by major topics (identified by headers)
    const lines = content.split('\n');
    let currentTopic = '';
    let currentContent: string[] = [];
    let currentContentArea = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect major topic headers
      if (this.isTopicHeader(line)) {
        // Save previous section
        if (currentTopic && currentContent.length > 0) {
          sections.push({
            topic: currentTopic,
            content: currentContent.join('\n').trim(),
            contentAreaId: this.mapToContentArea(currentTopic),
            subTopicId: undefined // Will map later
          });
        }

        // Start new section
        currentTopic = line;
        currentContent = [];
      } else if (line) {
        currentContent.push(line);
      }
    }

    // Save last section
    if (currentTopic && currentContent.length > 0) {
      sections.push({
        topic: currentTopic,
        content: currentContent.join('\n').trim(),
        contentAreaId: this.mapToContentArea(currentTopic),
        subTopicId: undefined
      });
    }

    return sections;
  }

  /**
   * Determine if a line is a topic header
   */
  private static isTopicHeader(line: string): boolean {
    const headerPatterns = [
      /^[A-Z\s]{3,}$/,  // All caps (e.g., "MEMORY CHARTS", "RESPA")
      /^(FHA|VA|USDA|CONFORMING|NON-CONFORMING|TILA|RESPA|FCRA)/i,
      /Chart$/i,
      /^Mortgage Markets?/i,
      /^Loan Program/i,
      /^Disclosures?/i,
      /^Education$/i
    ];

    return headerPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Map topic to content area ID
   */
  private static mapToContentArea(topic: string): string {
    const topicLower = topic.toLowerCase();

    // Federal Mortgage-Related Laws (RESPA, TILA, FCRA, etc.)
    if (topicLower.includes('respa') || topicLower.includes('tila') ||
        topicLower.includes('fcra') || topicLower.includes('closing disclosure') ||
        topicLower.includes('loan estimate') || topicLower.includes('ecoa') ||
        topicLower.includes('hmda') || topicLower.includes('glba')) {
      return 'federal-laws';
    }

    // Ethics (YES section maps here, plus ethics keywords)
    if (topicLower.includes('yes') || topicLower.includes('ethics') ||
        topicLower.includes('conduct') || topicLower.includes('fraud') ||
        topicLower.includes('fair lending') || topicLower.includes('privacy')) {
      return 'ethics';
    }

    // General Mortgage Knowledge (loan types, programs, calculations)
    if (topicLower.includes('fha') || topicLower.includes('va') ||
        topicLower.includes('conventional') || topicLower.includes('conforming') ||
        topicLower.includes('non-conforming') || topicLower.includes('mortgage market') ||
        topicLower.includes('mip') || topicLower.includes('insurance') ||
        topicLower.includes('varies by program')) {
      return 'general-knowledge';
    }

    // Mortgage Loan Origination Activities
    if (topicLower.includes('origination') || topicLower.includes('application') ||
        topicLower.includes('underwriting') || topicLower.includes('processing') ||
        topicLower.includes('documentation') || topicLower.includes('verification')) {
      return 'loan-origination';
    }

    // Uniform State Content (memory charts, state-specific)
    return 'uniform-state';
  }

  /**
   * Check if question contains word-for-word copying from source
   * Returns true if plagiarism detected
   */
  private static detectPlagiarism(
    questionText: string,
    sourceContent: string,
    threshold: number = 5
  ): boolean {
    // Check for sequences of words that match exactly
    const questionWords = questionText.toLowerCase().split(/\s+/);
    const sourceWords = sourceContent.toLowerCase().split(/\s+/);

    // Look for matching sequences of 'threshold' or more words
    for (let i = 0; i <= questionWords.length - threshold; i++) {
      const sequence = questionWords.slice(i, i + threshold).join(' ');
      const sourceText = sourceWords.join(' ');

      if (sourceText.includes(sequence)) {
        console.warn(`Potential plagiarism detected: "${sequence}"`);
        return true;
      }
    }

    return false;
  }

  /**
   * Generate questions from parsed sections using AI
   * (One-time batch generation to avoid repeated API calls)
   */
  static async generateQuestionsFromSection(
    section: { topic: string; content: string; contentAreaId: string },
    questionStyle: 'scenario' | 'definition' | 'calculation' | 'comparison' | 'application' = 'scenario',
    count: number = 20
  ): Promise<Array<{
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    explanation: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  }>> {
    const styleInstructions = {
      scenario: 'Create realistic scenario-based questions with client situations, loan officer decisions, and practical applications.',
      definition: 'Create questions testing knowledge of terms, concepts, and regulations with clear definitions.',
      calculation: 'Create questions requiring mathematical calculations, ratios, percentages, and numerical analysis.',
      comparison: 'Create questions comparing different loan programs, regulations, or requirements.',
      application: 'Create questions about applying regulations to specific situations and decision-making.'
    };

    const difficultyDistribution = Math.floor(count / 3);
    const easyCount = difficultyDistribution;
    const mediumCount = difficultyDistribution;
    const hardCount = count - (easyCount + mediumCount);

    const systemPrompt = `You are an NMLS exam question writer. Generate multiple-choice questions based on the provided study material.

CRITICAL COPYRIGHT REQUIREMENTS:
- DO NOT copy any text word-for-word from the source material
- REPHRASE all concepts in your own words
- Create ORIGINAL question scenarios and examples
- Use different terminology while maintaining accuracy
- Questions must be transformative, not derivative

QUESTION STYLE: ${styleInstructions[questionStyle]}

REQUIREMENTS:
1. Create ${count} questions with this distribution:
   - ${easyCount} EASY questions (basic recall and understanding)
   - ${mediumCount} MEDIUM questions (application and analysis)
   - ${hardCount} HARD questions (synthesis and evaluation)
2. Each question MUST have EXACTLY 4 options (A, B, C, D)
3. CRITICAL - Distractor Requirements:
   - One option is the CORRECT answer
   - The other 3 options are DISTRACTORS (wrong but plausible)
   - AT LEAST ONE distractor should be VERY CLOSE to the correct answer
   - Examples of good distractors:
     * If correct is "75% LTV", distractors: "80% LTV" (close %), "75% DTI" (right number, wrong term), "70% LTV" (close %)
     * If correct is "3 business days", distractors: "3 calendar days" (close but wrong), "5 business days" (wrong timing), "2 business days" (close)
     * If correct is "TILA", distractors: "RESPA" (similar law), "TRID" (related concept), "ECOA" (another regulation)
   - Distractors should represent common student mistakes
   - AVOID obviously wrong answers like "0%", "1000%", "never", "always"
4. Include a detailed explanation for the correct answer
5. Questions should test understanding, not just memorization
6. Use realistic scenarios when possible
7. Ensure all content is paraphrased and original
8. Do not use exact names, phrases, or sequences from source material
8. Vary question formats to maintain engagement
9. Include distractors that are plausible but clearly wrong

FORMAT YOUR RESPONSE AS JSON:
{
  "questions": [
    {
      "questionText": "...",
      "optionA": "...",
      "optionB": "...",
      "optionC": "...",
      "optionD": "...",
      "correctAnswer": "optionA|optionB|optionC|optionD",
      "explanation": "...",
      "difficulty": "EASY|MEDIUM|HARD"
    }
  ]
}`;

    const userPrompt = `Topic: ${section.topic}

Content:
${section.content}

Generate 5 high-quality NMLS exam questions based on this material.`;

    try {
      const response = await chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.questions || [];

    } catch (error) {
      console.error('Error generating questions:', error);
      return [];
    }
  }

  /**
   * Batch process all study materials and generate questions
   */
  static async batchProcessStudyMaterials(targetCount: number = 2000): Promise<{
    sectionsProcessed: number;
    questionsGenerated: number;
    questionsByStyle: Record<string, number>;
  }> {
    console.log(`Starting batch processing with target of ${targetCount} questions...`);

    // Parse study material
    const sections = await this.parseStudyMaterial('exam-prep-memory-charts.txt');
    console.log(`Found ${sections.length} sections to process`);

    // Calculate questions per section per style
    const questionStyles: Array<'scenario' | 'definition' | 'calculation' | 'comparison' | 'application'> =
      ['scenario', 'definition', 'calculation', 'comparison', 'application'];

    const questionsPerSectionPerStyle = Math.ceil(targetCount / (sections.length * questionStyles.length));
    console.log(`Generating ~${questionsPerSectionPerStyle} questions per style per section`);

    let totalQuestions = 0;
    const questionsByStyle: Record<string, number> = {
      scenario: 0,
      definition: 0,
      calculation: 0,
      comparison: 0,
      application: 0
    };

    // Get content areas and sub-topics from database
    const contentAreas = await prisma.contentArea.findMany({
      include: { subTopics: true }
    });

    for (const section of sections) {
      console.log(`\n=== Processing section: ${section.topic} ===`);

      // Find appropriate sub-topic
      const contentArea = contentAreas.find(ca => ca.id === section.contentAreaId);
      const subTopic = contentArea?.subTopics[0];

      if (!subTopic) {
        console.warn(`No sub-topic found for ${section.contentAreaId}, skipping...`);
        continue;
      }

      // Generate questions for each style
      for (const style of questionStyles) {
        console.log(`  Generating ${style} questions (target: ${questionsPerSectionPerStyle})...`);

        try {
          // Generate in smaller batches of 10 to ensure AI compliance
          const batchSize = 10;
          const numBatches = Math.ceil(questionsPerSectionPerStyle / batchSize);
          let allQuestions: any[] = [];

          for (let batch = 0; batch < numBatches; batch++) {
            const questionsInThisBatch = Math.min(batchSize, questionsPerSectionPerStyle - allQuestions.length);
            const questions = await this.generateQuestionsFromSection(
              section,
              style,
              questionsInThisBatch
            );
            allQuestions.push(...questions);

            if (allQuestions.length >= questionsPerSectionPerStyle) break;
          }

          const questions = allQuestions;
          console.log(`  Generated ${questions.length} ${style} questions`);

          // Save to database (with plagiarism check)
          let savedCount = 0;
          for (const q of questions) {
            try {
              // Check for plagiarism
              const hasPlagiarism = this.detectPlagiarism(q.questionText, section.content);

              if (hasPlagiarism) {
                console.warn(`    ⚠️  Skipping plagiarized question: "${q.questionText.substring(0, 40)}..."`);
                continue;
              }

              // Also check explanation
              const explanationPlagiarism = this.detectPlagiarism(q.explanation, section.content);

              if (explanationPlagiarism) {
                console.warn(`    ⚠️  Skipping plagiarized explanation: "${q.questionText.substring(0, 40)}..."`);
                continue;
              }

              await prisma.question.create({
                data: {
                  questionText: q.questionText,
                  optionA: q.optionA,
                  optionB: q.optionB,
                  optionC: q.optionC,
                  optionD: q.optionD,
                  correctAnswer: q.correctAnswer,
                  explanation: q.explanation,
                  difficulty: q.difficulty,
                  contentAreaId: section.contentAreaId,
                  subTopicId: subTopic.id,
                  bloomsLevel: 'UNDERSTAND',
                  
                  approvalStatus: 'PENDING', createdBy: 'AI'
                }
              });

              totalQuestions++;
              savedCount++;
              questionsByStyle[style]++;
            } catch (error) {
              console.error('    Error saving question:', error);
            }
          }

          console.log(`  ✓ Saved ${savedCount} ${style} questions`);
          console.log(`  Progress: ${totalQuestions}/${targetCount} questions`);

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 3000));

        } catch (error) {
          console.error(`  Error generating ${style} questions:`, error);
        }

        // Check if we've reached target
        if (totalQuestions >= targetCount) {
          console.log(`\n🎯 Target reached! Generated ${totalQuestions} questions.`);
          break;
        }
      }

      if (totalQuestions >= targetCount) {
        break;
      }
    }

    console.log(`\n=== Batch processing complete ===`);
    console.log(`Total questions: ${totalQuestions}`);
    console.log(`Questions by style:`, questionsByStyle);

    return {
      sectionsProcessed: sections.length,
      questionsGenerated: totalQuestions,
      questionsByStyle
    };
  }

  /**
   * Get statistics on knowledge base content
   */
  static async getKnowledgeBaseStats() {
    const totalQuestions = await prisma.question.count();
    const questionsByArea = await prisma.question.groupBy({
      by: ['contentAreaId'],
      _count: true
    });

    const questionsByDifficulty = await prisma.question.groupBy({
      by: ['difficulty'],
      _count: true
    });

    return {
      totalQuestions,
      byContentArea: questionsByArea,
      byDifficulty: questionsByDifficulty
    };
  }
}
