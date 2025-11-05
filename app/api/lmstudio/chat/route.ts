import { NextRequest, NextResponse } from 'next/server';

const LM_STUDIO_API = 'http://192.168.0.79:12345/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { messages, model } = await request.json();

    const startTime = Date.now();

    const response = await fetch(LM_STUDIO_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'default',
        messages: messages,
        temperature: 0.7,
        max_tokens: -1,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`LM Studio API error: ${response.statusText}`);
    }

    const data = await response.json();
    const endTime = Date.now();
    const responseTime = ((endTime - startTime) / 1000).toFixed(2);
    
    const tokensPerSecond = data.usage?.completion_tokens && responseTime
      ? (data.usage.completion_tokens / parseFloat(responseTime)).toFixed(2)
      : null;

    return NextResponse.json({
      success: true,
      message: {
        role: 'assistant',
        content: data.choices[0].message.content,
      },
      responseTime: parseFloat(responseTime),
      tokensPerSecond: tokensPerSecond ? parseFloat(tokensPerSecond) : null,
      metrics: {
        prompt_tokens: data.usage?.prompt_tokens,
        completion_tokens: data.usage?.completion_tokens,
        total_tokens: data.usage?.total_tokens,
      }
    });
  } catch (error) {
    console.error('LM Studio chat error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get response from LM Studio',
      },
      { status: 500 }
    );
  }
}
