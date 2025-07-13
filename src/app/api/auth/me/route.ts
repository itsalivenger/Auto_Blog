import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    
    if (!token) {
      return errorResponse('No token provided', 401)
    }

    const payload = verifyToken(token)
    if (!payload) {
      return errorResponse('Invalid token', 401)
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    if (!user) {
      return errorResponse('User not found', 404)
    }

    return successResponse(user)

  } catch (error) {
    console.error('Get user error:', error)
    return errorResponse('Internal server error', 500)
  }
} 