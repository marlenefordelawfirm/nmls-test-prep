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

// GET /api/admin/thresholds - List all thresholds
export async function GET(request: NextRequest) {
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
    const thresholds = await prisma.financialThreshold.findMany({
      orderBy: [
        { year: 'desc' },
        { key: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      thresholds
    });
  } catch (error) {
    console.error('Error fetching thresholds:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch thresholds' },
      { status: 500 }
    );
  }
}
