import { NextResponse } from 'next/server';

const LM_STUDIO_API = 'http://192.168.0.79:12345/v1/models';

export async function GET() {
  try {
    const response = await fetch(LM_STUDIO_API);
    
    if (!response.ok) {
      throw new Error(`LM Studio API error: ${response.statusText}`);
    }

    const data = await response.json();
    const models = data.data?.map((model: any) => model.id) || [];

    return NextResponse.json({
      success: true,
      models: models.length > 0 ? models : ['default'],
    });
  } catch (error) {
    console.error('Failed to fetch LM Studio models:', error);
    return NextResponse.json({
      success: true,
      models: ['default'],
    });
  }
}
