import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    interface OllamaModel {
      name: string;
      size: number;
      modified_at: string;
    }
    
    const models = data.models?.map((model: OllamaModel) => ({
      name: model.name,
      size: model.size,
      modified_at: model.modified_at,
    })) || [];
    
    return NextResponse.json({
      success: true,
      models: models,
    });
  } catch (error) {
    console.error('Failed to fetch Ollama models:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch models',
        models: []
      },
      { status: 200 }
    );
  }
}
