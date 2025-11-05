import { NextResponse } from 'next/server';
import { getAllConversations } from '@/lib/chatgpt';

export async function GET() {
  try {
    const conversations = await getAllConversations();
    
    return NextResponse.json({
      success: true,
      count: conversations.length,
      conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
