import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/utils/auth';

// GET /api/user/settings - Fetch user settings
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch or create user settings
    let settings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });

    // If settings don't exist, create default settings
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: user.id,
          // All other fields will use defaults from schema
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PATCH /api/user/settings - Update user settings
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const allowedFields = [
      'emailNotifications',
      'studyReminders',
      'achievementAlerts',
      'weeklyProgress',
      'questionsPerTest',
      'enableTimeLimit',
      'timeLimitMinutes',
      'showExplanations',
      'theme',
      'fontSize',
      'reduceMotion',
    ];

    // Filter out any fields not in allowedFields
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Validate questionsPerTest range
    if ('questionsPerTest' in updateData) {
      const value = updateData.questionsPerTest as number;
      if (value < 10 || value > 50) {
        return NextResponse.json(
          { success: false, error: 'Questions per test must be between 10 and 50' },
          { status: 400 }
        );
      }
    }

    // Validate timeLimitMinutes range
    if ('timeLimitMinutes' in updateData) {
      const value = updateData.timeLimitMinutes as number;
      if (value < 5 || value > 120) {
        return NextResponse.json(
          { success: false, error: 'Time limit must be between 5 and 120 minutes' },
          { status: 400 }
        );
      }
    }

    // Validate theme
    if ('theme' in updateData) {
      const value = updateData.theme as string;
      if (!['light', 'dark', 'system'].includes(value)) {
        return NextResponse.json(
          { success: false, error: 'Theme must be light, dark, or system' },
          { status: 400 }
        );
      }
    }

    // Validate fontSize
    if ('fontSize' in updateData) {
      const value = updateData.fontSize as string;
      if (!['small', 'medium', 'large'].includes(value)) {
        return NextResponse.json(
          { success: false, error: 'Font size must be small, medium, or large' },
          { status: 400 }
        );
      }
    }

    // Update settings using upsert (create if doesn't exist, update if exists)
    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: updateData,
      create: {
        userId: user.id,
        ...updateData,
      },
    });

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
