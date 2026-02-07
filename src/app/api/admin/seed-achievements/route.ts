import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-helpers';

const achievements = [
  {
    key: 'first_test',
    title: 'First Steps',
    description: 'Complete your first practice test',
    category: 'TESTS' as const,
    targetValue: 1,
    icon: 'target',
    sortOrder: 1,
  },
  {
    key: 'perfect_score',
    title: 'Perfect Score',
    description: 'Achieve a 100% score on any test',
    category: 'SCORES' as const,
    targetValue: 1,
    icon: 'check',
    sortOrder: 2,
  },
  {
    key: 'test_master',
    title: 'Test Master',
    description: 'Complete 10 practice tests',
    category: 'TESTS' as const,
    targetValue: 10,
    icon: 'trophy',
    sortOrder: 3,
  },
  {
    key: 'week_warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day study streak',
    category: 'STREAK' as const,
    targetValue: 7,
    icon: 'flame',
    sortOrder: 4,
  },
  {
    key: 'speed_learner',
    title: 'Speed Learner',
    description: 'Complete a full exam in under 2 hours',
    category: 'STUDY_TIME' as const,
    targetValue: 1,
    icon: 'zap',
    sortOrder: 5,
  },
  {
    key: 'knowledge_seeker',
    title: 'Knowledge Seeker',
    description: 'Answer 500 questions correctly',
    category: 'SCORES' as const,
    targetValue: 500,
    icon: 'book',
    sortOrder: 6,
  },
  {
    key: 'high_achiever',
    title: 'High Achiever',
    description: 'Score 85% or higher on 5 tests',
    category: 'SCORES' as const,
    targetValue: 5,
    icon: 'star',
    sortOrder: 7,
  },
  {
    key: 'dedicated_student',
    title: 'Dedicated Student',
    description: 'Spend 20 hours studying',
    category: 'STUDY_TIME' as const,
    targetValue: 1200, // 1200 minutes = 20 hours
    icon: 'book',
    sortOrder: 8,
  },
  {
    key: 'mastery_expert',
    title: 'Mastery Expert',
    description: 'Achieve 75% mastery in all content areas',
    category: 'MASTERY' as const,
    targetValue: 1,
    icon: 'graduation',
    sortOrder: 9,
  },
  {
    key: 'consistency_champion',
    title: 'Consistency Champion',
    description: 'Maintain a 14-day study streak',
    category: 'STREAK' as const,
    targetValue: 14,
    icon: 'muscle',
    sortOrder: 10,
  },
];

export async function POST() {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return authResult.error;
  }

  try {
    const results = [];

    for (const achievement of achievements) {
      const result = await prisma.achievement.upsert({
        where: { key: achievement.key },
        update: achievement,
        create: achievement,
      });
      results.push(result);
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${results.length} achievements`,
      data: results,
    });
  } catch (error) {
    console.error('Error seeding achievements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed achievements' },
      { status: 500 }
    );
  }
}
