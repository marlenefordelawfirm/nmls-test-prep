import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    // Only allow admin users
    if (!user || user.email !== 'thedamdocta@gmail.com') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

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
      return NextResponse.json({
        success: true,
        message: 'No corrupted correctAnswer values found',
        fixed: 0
      });
    }

    console.log(`⚠️  Found ${toFix.length} questions with corrupted correctAnswer values`);
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

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixed} corrupted correctAnswer values`,
      fixed,
      examples: toFix.slice(0, 5).map(item => `"${item.old}" -> "${item.new}"`),
      remainingBad: badQuestions.length
    });

  } catch (error) {
    console.error('Error fixing correctAnswer values:', error);
    return NextResponse.json(
      { error: 'Failed to fix correctAnswer values' },
      { status: 500 }
    );
  }
}
