import { NextRequest } from 'next/server'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { errorResponse } from '@/lib/utils'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
    role: string
  }
}

export function authenticateRequest(request: NextRequest): { success: boolean; user?: any; error?: any } {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return { success: false, error: errorResponse('Authentication required', 401) }
    }

    const payload = verifyToken(token)
    if (!payload) {
      return { success: false, error: errorResponse('Invalid token', 401) }
    }

    return { 
      success: true, 
      user: {
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      }
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return { success: false, error: errorResponse('Authentication failed', 401) }
  }
} 