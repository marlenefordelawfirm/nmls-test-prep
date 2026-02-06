import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { AIAgentService } from '@/services/AIAgentService';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, conversationId } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get or create conversation
    let convId = conversationId;
    
    if (!convId) {
      // Create new conversation with message as title
      convId = await AIAgentService.createConversation(
        session.user.id,
        message.slice(0, 50) + '...'
      );
    }

    // Get AI response
    const response = await AIAgentService.query(
      session.user.id,
      convId,
      message
    );

    return NextResponse.json({
      success: true,
      conversationId: convId,
      response
    });

  } catch (error) {
    console.error('Agent chat error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      // Load specific conversation
      const conversation = await prisma.agentConversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!conversation || conversation.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        conversation
      });
    } else {
      // List user's conversations
      const conversations = await AIAgentService.getUserConversations(
        session.user.id
      );

      return NextResponse.json({
        success: true,
        conversations
      });
    }
  } catch (error) {
    console.error('Error loading conversations:', error);
    return NextResponse.json(
      { error: 'Failed to load conversations' },
      { status: 500 }
    );
  }
}
