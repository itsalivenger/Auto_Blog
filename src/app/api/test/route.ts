import { NextResponse } from 'next/server';

export async function GET() {
  console.log('�� Test API route hit (GET)');
  return NextResponse.json({ message: 'Test route working!' });
}

export async function POST(request: Request) {
  console.log('🧪 Test API route hit (POST)');
  const body = await request.json();
  return NextResponse.json({ message: 'POST route working!', received: body });
} 