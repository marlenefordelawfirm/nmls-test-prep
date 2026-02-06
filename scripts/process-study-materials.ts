/**
 * Script to batch process study materials and generate questions
 * Run with: npx tsx scripts/process-study-materials.ts [targetCount]
 * Example: npx tsx scripts/process-study-materials.ts 2000
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { KnowledgeBaseService } from '../src/services/KnowledgeBaseService';

async function main() {
  const targetCount = parseInt(process.argv[2]) || 2000;

  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  NMLS Study Materials Batch Processor         ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  try {
    // Get current stats
    console.log('📊 Current knowledge base stats:');
    const statsBefore = await KnowledgeBaseService.getKnowledgeBaseStats();
    console.log(`   Total questions: ${statsBefore.totalQuestions}`);
    console.log(`   By content area:`, statsBefore.byContentArea);
    console.log(`   By difficulty:`, statsBefore.byDifficulty);
    console.log('\n');

    // Process materials
    console.log(`🎯 Target: ${targetCount} questions\n`);
    const startTime = Date.now();

    const result = await KnowledgeBaseService.batchProcessStudyMaterials(targetCount);

    const duration = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║  Processing Complete!                          ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log(`\n✅ Sections processed: ${result.sectionsProcessed}`);
    console.log(`✅ Questions generated: ${result.questionsGenerated}`);
    console.log(`⏱️  Time elapsed: ${minutes}m ${seconds}s`);
    console.log(`\n📈 Questions by style:`);
    Object.entries(result.questionsByStyle).forEach(([style, count]) => {
      console.log(`   ${style.padEnd(15)}: ${count}`);
    });

    // Get updated stats
    console.log('\n📊 Updated knowledge base stats:');
    const statsAfter = await KnowledgeBaseService.getKnowledgeBaseStats();
    console.log(`   Total questions: ${statsAfter.totalQuestions}`);
    console.log(`   New questions: +${statsAfter.totalQuestions - statsBefore.totalQuestions}`);
    console.log(`\n   By content area:`, statsAfter.byContentArea);
    console.log(`   By difficulty:`, statsAfter.byDifficulty);

    console.log('\n✨ Done! Questions are ready for admin review.');

  } catch (error) {
    console.error('\n❌ Error during batch processing:', error);
    process.exit(1);
  }
}

main();
