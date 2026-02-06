/**
 * Direct batch processing script
 * Calls KnowledgeBaseService directly without API authentication
 */

// This script runs in the Next.js context, so it can access the database
import './env-setup';

async function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  NMLS Question Generation - Starting...       ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  // Dynamically import after environment is set up
  const { KnowledgeBaseService } = await import('../src/services/KnowledgeBaseService');

  const targetCount = 2000;

  try {
    // Get initial stats
    console.log('📊 Checking current database...');
    const statsBefore = await KnowledgeBaseService.getKnowledgeBaseStats();
    console.log(`   Current questions: ${statsBefore.totalQuestions}\n`);

    // Start processing
    console.log(`🎯 Target: ${targetCount} questions`);
    console.log(`⏳ Estimated time: 15-30 minutes`);
    console.log(`📝 Generating questions with smart distractors...\n`);

    const startTime = Date.now();

    const result = await KnowledgeBaseService.batchProcessStudyMaterials(targetCount);

    const duration = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║  ✅ Generation Complete!                       ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    console.log(`✅ Sections processed: ${result.sectionsProcessed}`);
    console.log(`✅ Questions generated: ${result.questionsGenerated}`);
    console.log(`⏱️  Time elapsed: ${minutes}m ${seconds}s\n`);

    console.log(`📈 Questions by style:`);
    Object.entries(result.questionsByStyle).forEach(([style, count]) => {
      const percentage = ((count / result.questionsGenerated) * 100).toFixed(1);
      console.log(`   ${style.padEnd(15)}: ${String(count).padStart(4)} (${percentage}%)`);
    });

    // Get final stats
    const statsAfter = await KnowledgeBaseService.getKnowledgeBaseStats();
    console.log(`\n📊 Final database stats:`);
    console.log(`   Total questions: ${statsAfter.totalQuestions}`);
    console.log(`   New questions: +${result.questionsGenerated}`);

    console.log(`\n✨ All questions saved with status: PENDING`);
    console.log(`👉 Admin can review and approve at: http://localhost:3000/admin/questions\n`);

  } catch (error) {
    console.error('\n❌ Error during generation:', error);
    console.error('\nStack trace:', error instanceof Error ? error.stack : 'No stack trace');
    process.exit(1);
  }
}

main();
