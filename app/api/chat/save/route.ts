import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { title, messages, model, conversationId } = await request.json();
    
    const db = await getDatabase();
    const collection = db.collection('ollama');
    
    function generateRandomId(): string {
      return Math.random().toString(36).substring(2, 15) + 
             Math.random().toString(36).substring(2, 15);
    }
    
    const now = new Date();
    const convId = conversationId || `ollama-${Date.now()}-${generateRandomId()}`;
    
    const updateData = {
      conversation_id: convId,
      random_id: generateRandomId(),
      title: title || 'Ollama Conversation',
      default_model_slug: model,
      updated_at: now,
      messages: messages,
      message_count: messages.length,
      source: 'ollama',
    };
    
    const result = await collection.updateOne(
      { conversation_id: convId },
      { 
        $set: updateData,
        $setOnInsert: { 
          created_at: now,
          added_to_database: now,
        }
      },
      { upsert: true }
    );
    
    return NextResponse.json({
      success: true,
      id: result.upsertedId,
      conversation_id: convId,
    });
  } catch (error) {
    console.error('❌ Error saving Ollama conversation:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save conversation',
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}
