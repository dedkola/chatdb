import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { title, messages, model, conversationId } = await request.json();
    
    const db = await getDatabase();
    const collection = db.collection('lmstudio');
    
    function generateRandomId(): string {
      return Math.random().toString(36).substring(2, 15) + 
             Math.random().toString(36).substring(2, 15);
    }
    
    const now = new Date();
    const convId = conversationId || `lmstudio-${Date.now()}-${generateRandomId()}`;
    
    const updateData = {
      conversation_id: convId,
      random_id: generateRandomId(),
      title: title || 'LM Studio Conversation',
      default_model_slug: model,
      updated_at: now,
      messages: messages,
      message_count: messages.length,
      source: 'lmstudio',
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
    console.error('Error saving LM Studio conversation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save conversation',
      },
      { status: 500 }
    );
  }
}
