import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { query, collection } = await request.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Search query is required',
      });
    }

    const db = await getDatabase();
    const searchQuery = {
      'messages.content': { $regex: query, $options: 'i' }
    };

    let collectionsToSearch: string[] = [];
    
    if (collection === 'all') {
      collectionsToSearch = ['chatgpt', 'ollama', 'lmstudio'];
    } else {
      collectionsToSearch = [collection];
    }

    const searchPromises = collectionsToSearch.map(async (collName) => {
      const coll = db.collection(collName);
      const conversations = await coll.find(searchQuery).toArray();
      
      return conversations.map((conv: any) => {
        const matchedMessages = conv.messages
          .map((msg: any, index: number) => ({
            message: msg.content,
            index: index,
            matches: msg.content.toLowerCase().includes(query.toLowerCase())
          }))
          .filter((item: any) => item.matches);

        return matchedMessages.map((match: any) => ({
          conversation_id: conv.conversation_id,
          title: conv.title || 'Untitled Conversation',
          source: conv.source || collName,
          matchedMessage: match.message,
          messageIndex: match.index,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
        }));
      }).flat();
    });

    const allResults = await Promise.all(searchPromises);
    const flatResults = allResults.flat();

    flatResults.sort((a: any, b: any) => {
      const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      results: flatResults,
      count: flatResults.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search',
      },
      { status: 500 }
    );
  }
}
