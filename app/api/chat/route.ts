import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages, model = 'llama2' } = await request.json();
    
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    
    const startTime = Date.now();
    
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    const endTime = Date.now();
    const responseTime = ((endTime - startTime) / 1000).toFixed(2);
    
    const tokensPerSecond = data.eval_count && data.eval_duration 
      ? (data.eval_count / (data.eval_duration / 1e9)).toFixed(2)
      : null;
    
    return NextResponse.json({
      success: true,
      message: data.message,
      model: data.model,
      responseTime: parseFloat(responseTime),
      tokensPerSecond: tokensPerSecond ? parseFloat(tokensPerSecond) : null,
      metrics: {
        eval_count: data.eval_count,
        eval_duration: data.eval_duration,
        prompt_eval_count: data.prompt_eval_count,
        prompt_eval_duration: data.prompt_eval_duration,
      }
    });
  } catch (error) {
    console.error('Ollama chat error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to chat with Ollama' 
      },
      { status: 500 }
    );
  }
}
