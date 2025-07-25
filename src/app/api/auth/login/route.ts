import { NextRequest } from 'next/server'
import { successResponse, errorResponse, validateEmail } from '@/lib/utils'
import { verifyPassword, generateToken } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function POST(request: NextRequest) {
  
  try {
    const body = await request.json()
    const { email, password } = body

    // Validation
    if (!email || !password) {
      return errorResponse('Email and password are required')
    }

    if (!validateEmail(email)) {
      return errorResponse('Invalid email format')
    }

    const db = await getDb()

    // Find user
    const user = await db.collection('users').findOne({ email })

    if (!user) {
      return errorResponse('Invalid credentials')
    }

    // Verify password
    const isValidPassword = verifyPassword(password, user.password)
    if (!isValidPassword) {
      return errorResponse('Invalid credentials')
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    })

    return successResponse({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    }, 'Login successful')

  } catch (error) {
    console.error('Login error:', error)
    return errorResponse('Internal server error', 500)
  }
} 