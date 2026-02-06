/**
 * Monitor question generation progress
 */

import './env-setup';

async function checkProgress() {
  const { prisma } = await import('../src/lib/db');

  try {
    const ethics = await prisma.question.count({
      where: { subTopic: { contentArea: { id: 'ethics' } } }
    });

    const generalKnowledge = await prisma.question.count({
      where: { subTopic: { contentArea: { id: 'general-knowledge' } } }
    });

    const loanOrigination = await prisma.question.count({
      where: { subTopic: { contentArea: { id: 'loan-origination' } } }
    });

    const ethicsNeeded = Math.max(0, 400 - ethics);
    const generalNeeded = Math.max(0, 400 - generalKnowledge);
    const loanOrigNeeded = Math.max(0, 400 - loanOrigination);

    const totalGenerated = ethics + generalKnowledge + loanOrigination;
    const totalNeeded = ethicsNeeded + generalNeeded + loanOrigNeeded;

    console.log('\n📊 Generation Progress:\n');
    console.log(`  Ethics:              ${ethics.toString().padStart(3)} / 400 ${ethicsNeeded > 0 ? `(${ethicsNeeded} remaining)` : '✅'}`);
    console.log(`  General Knowledge:   ${generalKnowledge.toString().padStart(3)} / 400 ${generalNeeded > 0 ? `(${generalNeeded} remaining)` : '✅'}`);
    console.log(`  Loan Origination:    ${loanOrigination.toString().padStart(3)} / 400 ${loanOrigNeeded > 0 ? `(${loanOrigNeeded} remaining)` : '✅'}`);
    console.log(`  ${''.padEnd(35, '-')}`);
    console.log(`  Total:               ${totalGenerated.toString().padStart(3)} / 1200`);

    if (totalNeeded === 0) {
      console.log('\n✅ All categories complete!\n');
    } else {
      const percentComplete = ((totalGenerated / 1200) * 100).toFixed(1);
      console.log(`\n  Progress: ${percentComplete}% complete (${totalNeeded} questions remaining)\n`);
    }

    await prisma.$disconnect();
    return totalNeeded === 0;

  } catch (error) {
    console.error('❌ Error checking progress:', error);
    await prisma.$disconnect();
    return false;
  }
}

async function monitor() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  Question Generation Monitor                   ║');
  console.log('╚════════════════════════════════════════════════╝');

  while (true) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`\n[${timestamp}] Checking progress...`);

    const isComplete = await checkProgress();

    if (isComplete) {
      console.log('🎉 Generation complete! All categories have reached 400 questions.');
      break;
    }

    // Wait 3 minutes before next check
    console.log('⏳ Next check in 3 minutes...');
    await new Promise(resolve => setTimeout(resolve, 180000)); // 3 minutes
  }
}

monitor();
