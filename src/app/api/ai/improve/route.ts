import { NextRequest, NextResponse } from 'next/server'
import { improveText, improveForSEO } from '@/lib/ai-utils'

export async function POST(request: NextRequest) {
  try {
    console.log('AI improvement API called');
    
    const body = await request.json()
    const { text, type } = body

    console.log('Request body:', { text: text?.substring(0, 100) + '...', type });

    if (!text) {
      console.log('Error: Text is required');
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    if (!type || (type !== 'seo' && type !== 'general')) {
      console.log('Error: Invalid type parameter');
      return NextResponse.json(
        { error: 'Type must be either "seo" or "general"' },
        { status: 400 }
      )
    }

    console.log(`Calling AI improvement with type: ${type}`);
    let improvedText: string

    if (type === 'seo') {
      improvedText = await improveForSEO(text)
    } else {
      improvedText = await improveText(text)
    }

    console.log('AI improvement successful, returning result');
    return NextResponse.json({
      success: true,
      improvedText,
      originalText: text
    })
  } catch (error) {
    console.error('Error in AI improvement API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to improve text'
    console.error('Error message:', errorMessage)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
} 