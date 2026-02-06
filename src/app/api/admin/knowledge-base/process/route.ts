import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/utils/auth';
import { KnowledgeBaseService } from '@/services/KnowledgeBaseService';

/**
 * API endpoint to trigger batch processing of study materials
 * Admin-only endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    // Verify admin access
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    console.log(`Admin ${user.email} initiated knowledge base processing`);

    // Get current stats
    const statsBefore = await KnowledgeBaseService.getKnowledgeBaseStats();

    // Process materials
    const result = await KnowledgeBaseService.batchProcessStudyMaterials();

    // Get updated stats
    const statsAfter = await KnowledgeBaseService.getKnowledgeBaseStats();

    return NextResponse.json({
      success: true,
      result: {
        sectionsProcessed: result.sectionsProcessed,
        questionsGenerated: result.questionsGenerated,
        statsBefore,
        statsAfter
      }
    });

  } catch (error) {
    console.error('Knowledge base processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process knowledge base' },
      { status: 500 }
    );
  }
}

/**
 * Get current knowledge base statistics
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    // Verify admin access
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const stats = await KnowledgeBaseService.getKnowledgeBaseStats();

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching knowledge base stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
