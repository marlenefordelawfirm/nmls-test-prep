import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { rateLimit, RateLimitPresets, addRateLimitHeaders } from '@/lib/rate-limit';

const RegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[@$!%*?&]/, 'Password must contain at least one special character'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  state: z.string().optional()
});

export async function POST(req: NextRequest) {
  // Apply rate limiting (5 requests per 15 minutes)
  const rateLimitResult = await rateLimit(req, RateLimitPresets.auth);
  if (!rateLimitResult.success && rateLimitResult.response) {
    return rateLimitResult.response;
  }

  try {
    const body = await req.json();
    const data = RegisterSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'User with this email already exists'
          }
        },
        { status: 400 }
      );
    }

    // Hash password with bcrypt (12 rounds)
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create user with default settings
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        state: data.state,
        role: 'STUDENT',
        subscriptionTier: 'FREE',
        settings: {
          create: {
            // All fields use defaults from schema
            // emailNotifications: true,
            // studyReminders: true,
            // achievementAlerts: true,
            // weeklyProgress: false,
            // questionsPerTest: 20,
            // enableTimeLimit: false,
            // timeLimitMinutes: 30,
            // showExplanations: true,
            // theme: 'system',
            // fontSize: 'medium',
            // reduceMotion: false,
          }
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionTier: true,
        createdAt: true
      }
    });

    const response = NextResponse.json({
      success: true,
      data: { user },
      error: null
    }, { status: 201 });

    return addRateLimitHeaders(response, rateLimitResult);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: error.issues
          }
        },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal server error'
        }
      },
      { status: 500 }
    );
  }
}
