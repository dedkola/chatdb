import { NextRequest, NextResponse } from 'next/server';
import { saveConversations, ChatGPTConversation } from '@/lib/chatgpt';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { cleanData = true } = data;
    
    let conversations: ChatGPTConversation[];
    
    if (Array.isArray(data)) {
      conversations = data;
    } else if (data.conversations) {
      conversations = data.conversations;
    } else {
      conversations = [data];
    }

    const result = await saveConversations(conversations, cleanData);
    
    return NextResponse.json({
      success: true,
      message: `Saved ${conversations.length} conversations (${cleanData ? 'cleaned' : 'raw'} data)`,
      inserted: result.upsertedCount,
      modified: result.modifiedCount,
      cleanData
    });
  } catch (error) {
    console.error('Error uploading conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload conversations' },
      { status: 500 }
    );
  }
}
