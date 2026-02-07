import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { requireAdmin } from '@/lib/auth-helpers';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// PATCH /api/admin/thresholds/[id] - Update a threshold value
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, RateLimitPresets.admin);
  if (!rateLimitResult.success && rateLimitResult.response) {
    return rateLimitResult.response;
  }

  // Require admin authentication
  const authResult = await requireAdmin();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { value } = body;

    if (typeof value !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Value must be a number' },
        { status: 400 }
      );
    }

    const threshold = await prisma.financialThreshold.update({
      where: { id },
      data: {
        value,
        lastUpdated: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      threshold
    });
  } catch (error) {
    console.error('Error updating threshold:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update threshold' },
      { status: 500 }
    );
  }
}

// GET /api/admin/thresholds/[id] - Get a specific threshold
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, RateLimitPresets.admin);
  if (!rateLimitResult.success && rateLimitResult.response) {
    return rateLimitResult.response;
  }

  // Require admin authentication
  const authResult = await requireAdmin();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const { id } = await params;

    const threshold = await prisma.financialThreshold.findUnique({
      where: { id }
    });

    if (!threshold) {
      return NextResponse.json(
        { success: false, error: 'Threshold not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      threshold
    });
  } catch (error) {
    console.error('Error fetching threshold:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch threshold' },
      { status: 500 }
    );
  }
}
