import { NextRequest } from 'next/server'
import { successResponse, errorResponse, validateEmail, validatePassword } from '@/lib/utils'
import { hashPassword, generateToken } from '@/lib/auth'
import prisma from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validation
    if (!email || !password || !name) {
      return errorResponse('Email, password, and name are required')
    }

    if (!validateEmail(email)) {
      return errorResponse('Invalid email format')
    }

    if (!validatePassword(password)) {
      return errorResponse('Password must be at least 8 characters long')
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return errorResponse('User with this email already exists')
    }

    // Hash password and create user
    const hashedPassword = hashPassword(password)
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER'
      }
    })

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    }, 'User registered successfully')

  } catch (error) {
    console.error('Registration error:', error)
    return errorResponse('Internal server error', 500)
  }
} 