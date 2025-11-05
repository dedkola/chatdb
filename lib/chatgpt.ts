import { getDatabase } from './mongodb';
import { Collection, Document } from 'mongodb';

export interface ChatGPTMessage {
  id: string;
  author: {
    role: string;
  };
  content: {
    content_type: string;
    parts: string[];
  };
  create_time?: number;
  update_time?: number;
}

export interface ChatGPTMappingNode {
  id: string;
  message: ChatGPTMessage | null;
  parent: string | null;
  children: string[];
}

export interface ChatGPTConversation {
  id: string;
  title?: string;
  create_time?: number;
  update_time?: number;
  mapping?: Record<string, ChatGPTMappingNode>;
  current_node?: string;
  default_model_slug?: string;
}

export interface CleanMessage {
  role: string;
  content: string;
  timestamp?: number;
}

export interface CleanConversation {
  conversation_id: string;
  random_id: string;
  title: string;
  default_model_slug?: string;
  created_at: Date;
  updated_at: Date;
  added_to_database: Date;
  messages: CleanMessage[];
  message_count: number;
  source: 'chatgpt' | 'ollama';
}

function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export function cleanConversationData(rawData: ChatGPTConversation): CleanConversation {
  const messages: CleanMessage[] = [];
  
  if (rawData.mapping) {
    Object.values(rawData.mapping).forEach((node) => {
      const msg = node.message;
      if (!msg) return;
      
      const role = msg.author?.role;
      if (role !== 'user' && role !== 'assistant') return;
      
      if (msg.content?.parts && msg.content.parts.length > 0) {
        const content = msg.content.parts.join('\n').trim();
        if (content) {
          messages.push({
            role: role,
            content: content,
            timestamp: msg.create_time,
          });
        }
      }
    });
  }

  return {
    conversation_id: rawData.id,
    random_id: generateRandomId(),
    title: rawData.title || 'Untitled Conversation',
    default_model_slug: rawData.default_model_slug,
    created_at: rawData.create_time ? new Date(rawData.create_time * 1000) : new Date(),
    updated_at: rawData.update_time ? new Date(rawData.update_time * 1000) : new Date(),
    added_to_database: new Date(),
    messages: messages,
    message_count: messages.length,
    source: 'chatgpt',
  };
}

export async function getChatCollection(): Promise<Collection<Document>> {
  const db = await getDatabase();
  return db.collection('chatgpt');
}

export async function saveConversation(conversation: ChatGPTConversation, cleanData = true) {
  const collection = await getChatCollection();
  
  if (cleanData) {
    const cleaned = cleanConversationData(conversation);
    return await collection.updateOne(
      { conversation_id: cleaned.conversation_id },
      { $set: cleaned },
      { upsert: true }
    );
  } else {
    return await collection.updateOne(
      { id: conversation.id },
      { $set: conversation },
      { upsert: true }
    );
  }
}

export async function saveConversations(conversations: ChatGPTConversation[], cleanData = true) {
  const collection = await getChatCollection();
  
  if (cleanData) {
    const operations = conversations.map(conv => {
      const cleaned = cleanConversationData(conv);
      return {
        updateOne: {
          filter: { conversation_id: cleaned.conversation_id },
          update: { $set: cleaned },
          upsert: true
        }
      };
    });
    return await collection.bulkWrite(operations);
  } else {
    const operations = conversations.map(conv => ({
      updateOne: {
        filter: { id: conv.id },
        update: { $set: conv },
        upsert: true
      }
    }));
    return await collection.bulkWrite(operations);
  }
}

export async function getAllConversations() {
  const db = await getDatabase();
  const chatgptCollection = db.collection('chatgpt');
  const ollamaCollection = db.collection('ollama');
  const lmstudioCollection = db.collection('lmstudio');
  
  const [chatgptConvs, ollamaConvs, lmstudioConvs] = await Promise.all([
    chatgptCollection.find({}).toArray(),
    ollamaCollection.find({}).toArray(),
    lmstudioCollection.find({}).toArray()
  ]);
  
  return [...chatgptConvs, ...ollamaConvs, ...lmstudioConvs].sort((a: any, b: any) => {
    const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
    const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
    return dateB - dateA;
  });
}

export async function getConversationById(id: string) {
  const db = await getDatabase();
  const chatgptCollection = db.collection('chatgpt');
  const ollamaCollection = db.collection('ollama');
  const lmstudioCollection = db.collection('lmstudio');
  
  let conversation = await chatgptCollection.findOne({ conversation_id: id });
  if (!conversation) {
    conversation = await ollamaCollection.findOne({ conversation_id: id });
  }
  if (!conversation) {
    conversation = await lmstudioCollection.findOne({ conversation_id: id });
  }
  
  return conversation;
}
