import { NextResponse } from 'next/server'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export function successResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
  })
}

export function errorResponse(error: string, status: number = 400): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  )
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  return password.length >= 8
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function formatDate(date: Date): string {
  return date.toISOString()
}

export function parseMongoDate(mongoDate: any): Date {
  if (typeof mongoDate === 'string') {
    return new Date(mongoDate);
  } else if (mongoDate && mongoDate.$date) {
    return new Date(mongoDate.$date);
  }
  return new Date(); // Fallback to current date
}

export function extractImageFromRSS(rssContent: string): string | null {
    if (typeof window === 'undefined') {
        return null;
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(rssContent, "text/html");
    const img = doc.querySelector('img');
    return img ? img.src : null;
}
