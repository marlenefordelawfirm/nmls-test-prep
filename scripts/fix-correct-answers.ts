/**
 * This script fixes corrupted correctAnswer values in the database
 * Changes "optionA" -> "A", "optionB" -> "B", etc.
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

import { prisma } from '../src/lib/db';

async function fixCorrectAnswers() {
  console.log('🔍 Checking for corrupted correctAnswer values...\n');

  // Find all questions with incorrect format
  const allQuestions = await prisma.question.findMany({
    select: {
      id: true,
      correctAnswer: true,
      questionText: true
    }
  });

  const toFix: Array<{ id: string; old: string; new: string }> = [];

  allQuestions.forEach(q => {
    if (q.correctAnswer.startsWith('option')) {
      // Extract the letter from "optionA" -> "A"
      const letter = q.correctAnswer.replace('option', '');
      if (['A', 'B', 'C', 'D'].includes(letter)) {
        toFix.push({
          id: q.id,
          old: q.correctAnswer,
          new: letter
        });
      }
    }
  });

  if (toFix.length === 0) {
    console.log('✅ No corrupted correctAnswer values found!');
    await prisma.$disconnect();
    return;
  }

  console.log(`⚠️  Found ${toFix.length} questions with corrupted correctAnswer values:\n`);
  toFix.slice(0, 5).forEach((item, i) => {
    console.log(`${i + 1}. "${item.old}" -> "${item.new}"`);
  });

  if (toFix.length > 5) {
    console.log(`... and ${toFix.length - 5} more\n`);
  }

  console.log('\n🔧 Fixing correctAnswer values...\n');

  let fixed = 0;
  for (const item of toFix) {
    await prisma.question.update({
      where: { id: item.id },
      data: { correctAnswer: item.new }
    });
    fixed++;
    if (fixed % 10 === 0) {
      console.log(`  ✓ Fixed ${fixed}/${toFix.length}...`);
    }
  }

  console.log(`\n✅ Successfully fixed ${fixed} correctAnswer values!`);
  console.log('\nVerifying fixes...\n');

  // Verify
  const badQuestions = await prisma.question.findMany({
    where: {
      NOT: {
        correctAnswer: {
          in: ['A', 'B', 'C', 'D']
        }
      }
    },
    select: {
      id: true,
      correctAnswer: true
    },
    take: 5
  });

  if (badQuestions.length > 0) {
    console.log(`⚠️  Warning: Still found ${badQuestions.length} questions with non-standard correctAnswer values:`);
    badQuestions.forEach((q, i) => {
      console.log(`${i + 1}. "${q.correctAnswer}"`);
    });
  } else {
    console.log('✅ All correctAnswer values are now valid (A, B, C, or D)!');
  }

  await prisma.$disconnect();
}

fixCorrectAnswers()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
