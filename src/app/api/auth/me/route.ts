import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { ObjectId } from 'mongodb'

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

    const db = await getDb()

    const user = await db.collection('users').findOne(
      { _id: new ObjectId(payload.userId) },
      { projection: { password: 0 } }
    )

    if (!user) {
      return errorResponse('User not found', 404)
    }

    return successResponse({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    })

  } catch (error) {
    console.error('Get user error:', error)
    return errorResponse('Internal server error', 500)
  }
} 