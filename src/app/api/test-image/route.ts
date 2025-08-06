import { NextRequest, NextResponse } from 'next/server';
import { generateImageFromText } from '@/lib/ai-utils';

export async function GET(request: NextRequest) {
  try {
    const testPrompt = "A futuristic cityscape with flying cars, as a watercolor painting.";
    console.log(`Generating image with test prompt: "${testPrompt}"`);

    const imageBuffer = await generateImageFromText(testPrompt);

    console.log("Image generated successfully.");

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (error) {
    console.error('Error in test-image route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
    return NextResponse.json(
      { error: 'Failed to generate image', details: errorMessage },
      { status: 500 }
    );
  }
}
